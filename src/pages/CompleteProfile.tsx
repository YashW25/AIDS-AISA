import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Phone, GraduationCap, Building, BookOpen, Hash, Loader2 } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const profileSchema = z.object({
  full_name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  mobile: z.string().trim().regex(/^[6-9]\d{9}$/, 'Enter valid 10-digit mobile number'),
  enrollment_number: z.string().trim().min(3, 'Enrollment number required').max(50, 'Too long'),
  year: z.string().min(1, 'Select your year'),
  branch: z.string().min(1, 'Select your branch'),
  college: z.string().trim().min(3, 'College name required').max(200, 'Too long'),
});

type ProfileForm = z.infer<typeof profileSchema>;

const years = ['First Year', 'Second Year', 'Third Year', 'Fourth Year'];
const branches = [
  'AI & DS',
  'Information Technology',
  'Electronics & Telecommunication',
  'Mechanical Engineering',
  'Civil Engineering',
  'Electrical Engineering',
  'Other',
];

const CompleteProfile = () => {
  const navigate = useNavigate();
  const { user, profile, loading, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: '',
      mobile: '',
      enrollment_number: '',
      year: '',
      branch: '',
      college: 'AI&DS Department',
    },
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
      return;
    }
    if (!loading && user) {
      // Check if user is an admin - skip profile completion
      const checkAdmin = async () => {
        const { data: clubAdmin } = await supabase
          .from('club_admins')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (clubAdmin) {
          navigate('/admin/dashboard');
          return;
        }

        if (profile?.is_profile_complete) {
          navigate('/dashboard');
        }
      };
      checkAdmin();
    }
  }, [user, profile, loading, navigate]);

  const handleSubmit = async (data: ProfileForm) => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      let error;
      if (existingProfile) {
        // Update existing
        const result = await supabase.from('user_profiles')
          .update({
            ...data,
            is_profile_complete: true,
          })
          .eq('user_id', user.id);
        error = result.error;
      } else {
        // Insert new - cast to bypass type checking since types are auto-generated
        const result = await supabase.from('user_profiles')
          .insert({
            user_id: user.id,
            ...data,
            is_profile_complete: true,
          } as any);
        error = result.error;
      }

      if (error) throw error;

      await refreshProfile();
      toast({ title: 'Profile completed!', description: 'Welcome!' });
      navigate('/dashboard');
    } catch (error: any) {
      if (error.message?.includes('enrollment_number')) {
        toast({
          title: 'Enrollment Number Exists',
          description: 'This enrollment number is already registered.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: error.message || 'Failed to save profile',
          variant: 'destructive',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <section className="min-h-screen py-20 gradient-hero flex items-center">
        <div className="container max-w-lg">
          <Card className="border-border/50 shadow-2xl backdrop-blur-sm bg-card/95">
            <CardHeader className="text-center space-y-2">
              <CardTitle className="font-display text-2xl">Complete Your Profile</CardTitle>
              <CardDescription>
                Fill in your details to access all features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="full_name"
                      placeholder="Enter your full name"
                      className="pl-10"
                      {...form.register('full_name')}
                    />
                  </div>
                  {form.formState.errors.full_name && (
                    <p className="text-sm text-destructive">{form.formState.errors.full_name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mobile">Mobile Number *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="mobile"
                      placeholder="10-digit mobile number"
                      className="pl-10"
                      {...form.register('mobile')}
                    />
                  </div>
                  {form.formState.errors.mobile && (
                    <p className="text-sm text-destructive">{form.formState.errors.mobile.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="enrollment_number">Enrollment Number *</Label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="enrollment_number"
                      placeholder="Your enrollment/PRN number"
                      className="pl-10"
                      {...form.register('enrollment_number')}
                    />
                  </div>
                  {form.formState.errors.enrollment_number && (
                    <p className="text-sm text-destructive">{form.formState.errors.enrollment_number.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Year *</Label>
                    <Select
                      value={form.watch('year')}
                      onValueChange={(value) => form.setValue('year', value)}
                    >
                      <SelectTrigger>
                        <GraduationCap className="h-4 w-4 mr-2 text-muted-foreground" />
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((year) => (
                          <SelectItem key={year} value={year}>{year}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.formState.errors.year && (
                      <p className="text-sm text-destructive">{form.formState.errors.year.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Branch *</Label>
                    <Select
                      value={form.watch('branch')}
                      onValueChange={(value) => form.setValue('branch', value)}
                    >
                      <SelectTrigger>
                        <BookOpen className="h-4 w-4 mr-2 text-muted-foreground" />
                        <SelectValue placeholder="Select branch" />
                      </SelectTrigger>
                      <SelectContent>
                        {branches.map((branch) => (
                          <SelectItem key={branch} value={branch}>{branch}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.formState.errors.branch && (
                      <p className="text-sm text-destructive">{form.formState.errors.branch.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="college">College Name *</Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="college"
                      placeholder="Your college name"
                      className="pl-10"
                      {...form.register('college')}
                    />
                  </div>
                  {form.formState.errors.college && (
                    <p className="text-sm text-destructive">{form.formState.errors.college.message}</p>
                  )}
                </div>

                <Button type="submit" className="w-full gradient-accent" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Complete Profile'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </MainLayout>
  );
};

export default CompleteProfile;
