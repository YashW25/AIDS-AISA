import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { email, password, full_name, role, club_id, action, user_id } = await req.json()

    console.log('Setup admin request:', { email, role, club_id, action })

    // Handle password reset action
    if (action === 'reset_password' && user_id) {
      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
        { auth: { autoRefreshToken: false, persistSession: false } }
      )

      const { error: resetError } = await supabaseAdmin.auth.admin.updateUserById(user_id, {
        password: '12345678',
      })

      if (resetError) {
        console.error('Error resetting password:', resetError)
        return new Response(
          JSON.stringify({ error: resetError.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      console.log('Password reset successfully for user:', user_id)
      return new Response(
        JSON.stringify({ success: true, message: 'Password reset to 12345678' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: 'Email and password required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create admin client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Check if user already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
    const existingUser = existingUsers?.users?.find(u => u.email === email)
    
    let userId: string

    if (existingUser) {
      console.log('User already exists, updating...')
      userId = existingUser.id
    } else {
      // Create the user
      const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      })

      if (createError) {
        console.error('Error creating user:', createError)
        return new Response(
          JSON.stringify({ error: createError.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      userId = userData.user.id
    }

    const adminRole = role || 'admin'
    const adminName = full_name || 'Admin User'
    const dbRole = adminRole === 'super_admin' ? 'super_admin' : (adminRole === 'teacher' ? 'teacher' : 'admin')

    // Add to user_roles table (upsert)
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .upsert({
        user_id: userId,
        role: dbRole,
      }, { onConflict: 'user_id,role' })

    if (roleError) {
      console.error('Error creating user role:', roleError)
    }

    // ALWAYS add to admin_profiles for all admin types
    const profileRole = adminRole === 'super_admin' ? 'super_admin' : (adminRole === 'teacher' ? 'editor' : 'admin')
    const { error: profileError } = await supabaseAdmin
      .from('admin_profiles')
      .upsert({
        id: userId,
        email: email,
        full_name: adminName,
        role: profileRole,
        is_active: true,
      }, { onConflict: 'id' })

    if (profileError) {
      console.error('Error creating admin profile:', profileError)
    }

    // If super_admin, we're done (no club assignment needed)
    if (adminRole === 'super_admin') {
      console.log('Super admin created/updated successfully:', email)
      return new Response(
        JSON.stringify({ success: true, message: 'Super admin created successfully', user_id: userId }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // For club admins, add to club_admins table
    if (club_id) {
      // Check if already exists
      const { data: existingClubAdmin } = await supabaseAdmin
        .from('club_admins')
        .select('id')
        .eq('user_id', userId)
        .eq('club_id', club_id)
        .maybeSingle()

      if (!existingClubAdmin) {
        const { error: clubAdminError } = await supabaseAdmin
          .from('club_admins')
          .insert({
            club_id: club_id,
            user_id: userId,
            role: adminRole === 'teacher' ? 'teacher' : 'admin',
            is_primary: false,
          })

        if (clubAdminError) {
          console.error('Error creating club admin:', clubAdminError)
          return new Response(
            JSON.stringify({ error: clubAdminError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
      }
    }

    console.log('Admin user created/updated successfully:', email)

    return new Response(
      JSON.stringify({ success: true, message: 'Admin user created successfully', user_id: userId }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error: unknown) {
    console.error('Error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})