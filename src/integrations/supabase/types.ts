export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      about_features: {
        Row: {
          club_id: string | null
          created_at: string | null
          description: string
          icon: string | null
          id: string
          is_active: boolean | null
          position: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          club_id?: string | null
          created_at?: string | null
          description: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          position?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          club_id?: string | null
          created_at?: string | null
          description?: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          position?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "about_features_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_profiles: {
        Row: {
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          is_active: boolean | null
          role: Database["public"]["Enums"]["admin_role"] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          is_active?: boolean | null
          role?: Database["public"]["Enums"]["admin_role"] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          role?: Database["public"]["Enums"]["admin_role"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      alumni: {
        Row: {
          branch: string | null
          club_id: string | null
          company: string | null
          created_at: string | null
          graduation_year: string
          id: string
          image_url: string | null
          is_active: boolean | null
          job_title: string | null
          linkedin_url: string | null
          name: string
          position: number | null
          testimonial: string | null
          updated_at: string | null
        }
        Insert: {
          branch?: string | null
          club_id?: string | null
          company?: string | null
          created_at?: string | null
          graduation_year: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          job_title?: string | null
          linkedin_url?: string | null
          name: string
          position?: number | null
          testimonial?: string | null
          updated_at?: string | null
        }
        Update: {
          branch?: string | null
          club_id?: string | null
          company?: string | null
          created_at?: string | null
          graduation_year?: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          job_title?: string | null
          linkedin_url?: string | null
          name?: string
          position?: number | null
          testimonial?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alumni_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      announcements: {
        Row: {
          club_id: string | null
          content: string
          created_at: string | null
          id: string
          is_active: boolean | null
          position: number | null
          updated_at: string | null
        }
        Insert: {
          club_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          position?: number | null
          updated_at?: string | null
        }
        Update: {
          club_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          position?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "announcements_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      certificate_templates: {
        Row: {
          cert_number_position_x: number | null
          cert_number_position_y: number | null
          club_id: string | null
          created_at: string | null
          date_position_x: number | null
          date_position_y: number | null
          event_id: string | null
          font_color: string | null
          font_size: number | null
          id: string
          is_active: boolean | null
          name_position_x: number | null
          name_position_y: number | null
          qr_position_x: number | null
          qr_position_y: number | null
          rank_position_x: number | null
          rank_position_y: number | null
          template_name: string
          template_url: string
          updated_at: string | null
        }
        Insert: {
          cert_number_position_x?: number | null
          cert_number_position_y?: number | null
          club_id?: string | null
          created_at?: string | null
          date_position_x?: number | null
          date_position_y?: number | null
          event_id?: string | null
          font_color?: string | null
          font_size?: number | null
          id?: string
          is_active?: boolean | null
          name_position_x?: number | null
          name_position_y?: number | null
          qr_position_x?: number | null
          qr_position_y?: number | null
          rank_position_x?: number | null
          rank_position_y?: number | null
          template_name: string
          template_url: string
          updated_at?: string | null
        }
        Update: {
          cert_number_position_x?: number | null
          cert_number_position_y?: number | null
          club_id?: string | null
          created_at?: string | null
          date_position_x?: number | null
          date_position_y?: number | null
          event_id?: string | null
          font_color?: string | null
          font_size?: number | null
          id?: string
          is_active?: boolean | null
          name_position_x?: number | null
          name_position_y?: number | null
          qr_position_x?: number | null
          qr_position_y?: number | null
          rank_position_x?: number | null
          rank_position_y?: number | null
          template_name?: string
          template_url?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "certificate_templates_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificate_templates_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      certificates: {
        Row: {
          certificate_number: string | null
          certificate_type: string
          certificate_url: string | null
          created_at: string | null
          event_id: string
          id: string
          issued_at: string | null
          rank: string | null
          template_id: string | null
          user_id: string
        }
        Insert: {
          certificate_number?: string | null
          certificate_type: string
          certificate_url?: string | null
          created_at?: string | null
          event_id: string
          id?: string
          issued_at?: string | null
          rank?: string | null
          template_id?: string | null
          user_id: string
        }
        Update: {
          certificate_number?: string | null
          certificate_type?: string
          certificate_url?: string | null
          created_at?: string | null
          event_id?: string
          id?: string
          issued_at?: string | null
          rank?: string | null
          template_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificates_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificates_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "certificate_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      charter_settings: {
        Row: {
          club_id: string | null
          created_at: string | null
          description: string | null
          drive_url: string | null
          file_type: string | null
          file_url: string | null
          id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          club_id?: string | null
          created_at?: string | null
          description?: string | null
          drive_url?: string | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          title?: string
          updated_at?: string | null
        }
        Update: {
          club_id?: string | null
          created_at?: string | null
          description?: string | null
          drive_url?: string | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "charter_settings_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      club_admins: {
        Row: {
          club_id: string
          created_at: string | null
          id: string
          is_primary: boolean | null
          role: string | null
          user_id: string
        }
        Insert: {
          club_id: string
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          role?: string | null
          user_id: string
        }
        Update: {
          club_id?: string
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "club_admins_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      clubs: {
        Row: {
          address: string | null
          college_name: string
          created_at: string | null
          email: string | null
          facebook_url: string | null
          full_name: string
          gradient_from: string | null
          gradient_to: string | null
          gradient_via: string | null
          id: string
          instagram_url: string | null
          is_active: boolean | null
          is_suspended: boolean | null
          linkedin_url: string | null
          logo_url: string | null
          name: string
          phone: string | null
          primary_color: string | null
          primary_domain: string | null
          secondary_color: string | null
          slug: string
          staging_domain: string | null
          suspension_reason: string | null
          tagline: string | null
          twitter_url: string | null
          updated_at: string | null
          youtube_url: string | null
        }
        Insert: {
          address?: string | null
          college_name: string
          created_at?: string | null
          email?: string | null
          facebook_url?: string | null
          full_name: string
          gradient_from?: string | null
          gradient_to?: string | null
          gradient_via?: string | null
          id?: string
          instagram_url?: string | null
          is_active?: boolean | null
          is_suspended?: boolean | null
          linkedin_url?: string | null
          logo_url?: string | null
          name: string
          phone?: string | null
          primary_color?: string | null
          primary_domain?: string | null
          secondary_color?: string | null
          slug: string
          staging_domain?: string | null
          suspension_reason?: string | null
          tagline?: string | null
          twitter_url?: string | null
          updated_at?: string | null
          youtube_url?: string | null
        }
        Update: {
          address?: string | null
          college_name?: string
          created_at?: string | null
          email?: string | null
          facebook_url?: string | null
          full_name?: string
          gradient_from?: string | null
          gradient_to?: string | null
          gradient_via?: string | null
          id?: string
          instagram_url?: string | null
          is_active?: boolean | null
          is_suspended?: boolean | null
          linkedin_url?: string | null
          logo_url?: string | null
          name?: string
          phone?: string | null
          primary_color?: string | null
          primary_domain?: string | null
          secondary_color?: string | null
          slug?: string
          staging_domain?: string | null
          suspension_reason?: string | null
          tagline?: string | null
          twitter_url?: string | null
          updated_at?: string | null
          youtube_url?: string | null
        }
        Relationships: []
      }
      contact_submissions: {
        Row: {
          admin_notes: string | null
          created_at: string
          email: string
          id: string
          message: string
          name: string
          priority: string
          status: string
          subject: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          priority?: string
          status?: string
          subject: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          priority?: string
          status?: string
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      custom_pages: {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          meta_description: string | null
          slug: string
          title: string
          updated_at: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          meta_description?: string | null
          slug: string
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          meta_description?: string | null
          slug?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      downloads: {
        Row: {
          category: string | null
          club_id: string | null
          created_at: string | null
          description: string | null
          drive_url: string | null
          file_size: string | null
          file_type: string | null
          file_url: string | null
          id: string
          is_active: boolean | null
          position: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          club_id?: string | null
          created_at?: string | null
          description?: string | null
          drive_url?: string | null
          file_size?: string | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          is_active?: boolean | null
          position?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          club_id?: string | null
          created_at?: string | null
          description?: string | null
          drive_url?: string | null
          file_size?: string | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          is_active?: boolean | null
          position?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "downloads_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      event_registrations: {
        Row: {
          created_at: string | null
          event_id: string
          id: string
          payment_status: string | null
          registration_status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          event_id: string
          id?: string
          payment_status?: string | null
          registration_status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          event_id?: string
          id?: string
          payment_status?: string | null
          registration_status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_winners: {
        Row: {
          created_at: string | null
          event_id: string
          id: string
          position: number
          prize_details: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          event_id: string
          id?: string
          position: number
          prize_details?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          event_id?: string
          id?: string
          position?: number
          prize_details?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_winners_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          actual_participants: number | null
          club_id: string | null
          created_at: string | null
          current_participants: number | null
          description: string | null
          drive_folder_link: string | null
          end_date: string | null
          entry_fee: number | null
          event_date: string
          event_type: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          is_completed: boolean | null
          location: string | null
          max_participants: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          actual_participants?: number | null
          club_id?: string | null
          created_at?: string | null
          current_participants?: number | null
          description?: string | null
          drive_folder_link?: string | null
          end_date?: string | null
          entry_fee?: number | null
          event_date: string
          event_type?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_completed?: boolean | null
          location?: string | null
          max_participants?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          actual_participants?: number | null
          club_id?: string | null
          created_at?: string | null
          current_participants?: number | null
          description?: string | null
          drive_folder_link?: string | null
          end_date?: string | null
          entry_fee?: number | null
          event_date?: string
          event_type?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_completed?: boolean | null
          location?: string | null
          max_participants?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      gallery: {
        Row: {
          category: string | null
          club_id: string | null
          created_at: string | null
          event_id: string | null
          id: string
          image_url: string
          is_active: boolean | null
          position: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          club_id?: string | null
          created_at?: string | null
          event_id?: string | null
          id?: string
          image_url: string
          is_active?: boolean | null
          position?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          club_id?: string | null
          created_at?: string | null
          event_id?: string | null
          id?: string
          image_url?: string
          is_active?: boolean | null
          position?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gallery_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gallery_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      hero_slides: {
        Row: {
          button_link: string | null
          button_text: string | null
          club_id: string | null
          created_at: string | null
          id: string
          image_url: string
          is_active: boolean | null
          position: number | null
          subtitle: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          button_link?: string | null
          button_text?: string | null
          club_id?: string | null
          created_at?: string | null
          id?: string
          image_url: string
          is_active?: boolean | null
          position?: number | null
          subtitle?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          button_link?: string | null
          button_text?: string | null
          club_id?: string | null
          created_at?: string | null
          id?: string
          image_url?: string
          is_active?: boolean | null
          position?: number | null
          subtitle?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hero_slides_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      nav_items: {
        Row: {
          created_at: string | null
          custom_page_id: string | null
          href: string
          icon: string | null
          id: string
          is_active: boolean | null
          label: string
          page_type: string
          parent_id: string | null
          position: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          custom_page_id?: string | null
          href?: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          label: string
          page_type?: string
          parent_id?: string | null
          position?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          custom_page_id?: string | null
          href?: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          label?: string
          page_type?: string
          parent_id?: string | null
          position?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nav_items_custom_page_id_fkey"
            columns: ["custom_page_id"]
            isOneToOne: false
            referencedRelation: "custom_pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nav_items_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "nav_items"
            referencedColumns: ["id"]
          },
        ]
      }
      news: {
        Row: {
          attachment_type: string | null
          attachment_url: string | null
          club_id: string | null
          content: string | null
          created_at: string | null
          expire_date: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          is_marquee: boolean | null
          position: number | null
          published_date: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          attachment_type?: string | null
          attachment_url?: string | null
          club_id?: string | null
          content?: string | null
          created_at?: string | null
          expire_date?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_marquee?: boolean | null
          position?: number | null
          published_date?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          attachment_type?: string | null
          attachment_url?: string | null
          club_id?: string | null
          content?: string | null
          created_at?: string | null
          expire_date?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_marquee?: boolean | null
          position?: number | null
          published_date?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "news_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      occasions: {
        Row: {
          category: string | null
          club_id: string | null
          cover_image_url: string | null
          created_at: string | null
          description: string | null
          drive_folder_link: string | null
          id: string
          is_active: boolean | null
          occasion_date: string | null
          position: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          club_id?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          drive_folder_link?: string | null
          id?: string
          is_active?: boolean | null
          occasion_date?: string | null
          position?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          club_id?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          drive_folder_link?: string | null
          id?: string
          is_active?: boolean | null
          occasion_date?: string | null
          position?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "occasions_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      partners: {
        Row: {
          club_id: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
          position: number | null
          updated_at: string | null
          website_url: string | null
        }
        Insert: {
          club_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          position?: number | null
          updated_at?: string | null
          website_url?: string | null
        }
        Update: {
          club_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          position?: number | null
          updated_at?: string | null
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partners_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          event_registration_id: string | null
          id: string
          notes: string | null
          payment_gateway_response: Json | null
          payment_method: string
          payment_status: string | null
          receipt_number: string | null
          transaction_id: string | null
          updated_at: string | null
          user_id: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          event_registration_id?: string | null
          id?: string
          notes?: string | null
          payment_gateway_response?: Json | null
          payment_method: string
          payment_status?: string | null
          receipt_number?: string | null
          transaction_id?: string | null
          updated_at?: string | null
          user_id: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          event_registration_id?: string | null
          id?: string
          notes?: string | null
          payment_gateway_response?: Json | null
          payment_method?: string
          payment_status?: string | null
          receipt_number?: string | null
          transaction_id?: string | null
          updated_at?: string | null
          user_id?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_event_registration_id_fkey"
            columns: ["event_registration_id"]
            isOneToOne: false
            referencedRelation: "event_registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      popup_announcements: {
        Row: {
          club_id: string | null
          created_at: string | null
          end_date: string | null
          id: string
          image_url: string
          is_active: boolean | null
          link_text: string | null
          link_url: string | null
          position: number | null
          start_date: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          club_id?: string | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          image_url: string
          is_active?: boolean | null
          link_text?: string | null
          link_url?: string | null
          position?: number | null
          start_date?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          club_id?: string | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          image_url?: string
          is_active?: boolean | null
          link_text?: string | null
          link_url?: string | null
          position?: number | null
          start_date?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "popup_announcements_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      quick_links: {
        Row: {
          category: string | null
          club_id: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          position: number | null
          title: string
          updated_at: string | null
          url: string
        }
        Insert: {
          category?: string | null
          club_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          position?: number | null
          title: string
          updated_at?: string | null
          url: string
        }
        Update: {
          category?: string | null
          club_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          position?: number | null
          title?: string
          updated_at?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "quick_links_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          address: string | null
          club_full_name: string
          club_name: string
          college_name: string
          created_at: string | null
          email: string | null
          facebook_url: string | null
          id: string
          instagram_url: string | null
          linkedin_url: string | null
          logo_url: string | null
          phone: string | null
          tagline: string | null
          twitter_url: string | null
          updated_at: string | null
          youtube_url: string | null
        }
        Insert: {
          address?: string | null
          club_full_name?: string
          club_name?: string
          college_name?: string
          created_at?: string | null
          email?: string | null
          facebook_url?: string | null
          id?: string
          instagram_url?: string | null
          linkedin_url?: string | null
          logo_url?: string | null
          phone?: string | null
          tagline?: string | null
          twitter_url?: string | null
          updated_at?: string | null
          youtube_url?: string | null
        }
        Update: {
          address?: string | null
          club_full_name?: string
          club_name?: string
          college_name?: string
          created_at?: string | null
          email?: string | null
          facebook_url?: string | null
          id?: string
          instagram_url?: string | null
          linkedin_url?: string | null
          logo_url?: string | null
          phone?: string | null
          tagline?: string | null
          twitter_url?: string | null
          updated_at?: string | null
          youtube_url?: string | null
        }
        Relationships: []
      }
      stats: {
        Row: {
          club_id: string | null
          created_at: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          label: string
          position: number | null
          updated_at: string | null
          value: string
        }
        Insert: {
          club_id?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          label: string
          position?: number | null
          updated_at?: string | null
          value: string
        }
        Update: {
          club_id?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          label?: string
          position?: number | null
          updated_at?: string | null
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "stats_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      team_categories: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          label: string
          name: string
          position: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          label: string
          name: string
          position?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          label?: string
          name?: string
          position?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      team_members: {
        Row: {
          category: string | null
          club_id: string | null
          created_at: string | null
          description: string | null
          email: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          linkedin_url: string | null
          name: string
          position: number | null
          role: string
          skills: string[] | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          club_id?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          linkedin_url?: string | null
          name: string
          position?: number | null
          role: string
          skills?: string[] | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          club_id?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          linkedin_url?: string | null
          name?: string
          position?: number | null
          role?: string
          skills?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_members_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          branch: string
          club_id: string | null
          college: string
          created_at: string | null
          enrollment_number: string
          full_name: string
          id: string
          is_profile_complete: boolean | null
          mobile: string
          updated_at: string | null
          user_id: string
          year: string
        }
        Insert: {
          avatar_url?: string | null
          branch: string
          club_id?: string | null
          college: string
          created_at?: string | null
          enrollment_number: string
          full_name: string
          id?: string
          is_profile_complete?: boolean | null
          mobile: string
          updated_at?: string | null
          user_id: string
          year: string
        }
        Update: {
          avatar_url?: string | null
          branch?: string
          club_id?: string | null
          college?: string
          created_at?: string | null
          enrollment_number?: string
          full_name?: string
          id?: string
          is_profile_complete?: boolean | null
          mobile?: string
          updated_at?: string | null
          user_id?: string
          year?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      visitor_counter: {
        Row: {
          count: number
          id: string
          updated_at: string | null
        }
        Insert: {
          count?: number
          id?: string
          updated_at?: string | null
        }
        Update: {
          count?: number
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_clubs: { Args: { _user_id: string }; Returns: string[] }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_visitor_count: { Args: never; Returns: number }
      is_admin: { Args: never; Returns: boolean }
      is_any_club_admin: { Args: never; Returns: boolean }
      is_club_admin: { Args: { _club_id: string }; Returns: boolean }
      is_super_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      admin_role: "super_admin" | "admin" | "editor"
      app_role: "admin" | "teacher" | "student" | "super_admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      admin_role: ["super_admin", "admin", "editor"],
      app_role: ["admin", "teacher", "student", "super_admin"],
    },
  },
} as const
