export interface SiteSettings {
  id: string;
  club_name: string;
  club_full_name: string;
  college_name: string;
  logo_url: string | null;
  tagline: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  linkedin_url: string | null;
  youtube_url: string | null;
  twitter_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Announcement {
  id: string;
  content: string;
  is_active: boolean;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface HeroSlide {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string;
  button_text: string | null;
  button_link: string | null;
  position: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AboutFeature {
  id: string;
  title: string;
  description: string;
  icon: string;
  position: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Stat {
  id: string;
  label: string;
  value: string;
  icon: string;
  position: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  title: string;
  description: string | null;
  event_type: string;
  event_date: string;
  end_date: string | null;
  location: string | null;
  max_participants: number | null;
  current_participants: number;
  image_url: string | null;
  entry_fee: number;
  is_active: boolean;
  is_completed: boolean;
  drive_folder_link: string | null;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  description: string | null;
  category: string;
  image_url: string | null;
  email: string | null;
  linkedin_url: string | null;
  skills: string[] | null;
  position: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  image_url: string;
  category: string;
  event_id: string | null;
  position: number;
  is_active: boolean;
  drive_folder_link: string | null;
  created_at: string;
  updated_at: string;
}

export interface QuickLink {
  id: string;
  title: string;
  url: string;
  category: string;
  position: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Partner {
  id: string;
  name: string;
  logo_url: string | null;
  website_url: string | null;
  position: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: 'super_admin' | 'admin' | 'editor';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  mobile: string;
  enrollment_number: string;
  year: string;
  branch: string;
  college: string;
  avatar_url: string | null;
  is_profile_complete: boolean;
  created_at: string;
  updated_at: string;
}

export interface EventRegistration {
  id: string;
  user_id: string;
  event_id: string;
  registration_status: 'pending' | 'confirmed' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  created_at: string;
  updated_at: string;
  event?: Event;
}

export interface Payment {
  id: string;
  user_id: string;
  event_registration_id: string | null;
  amount: number;
  payment_method: 'cashfree' | 'manual' | 'free';
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  transaction_id: string | null;
  payment_gateway_response: Record<string, unknown> | null;
  receipt_number: string | null;
  verified_by: string | null;
  verified_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  event_registration?: EventRegistration;
}

export interface Certificate {
  id: string;
  user_id: string;
  event_id: string;
  certificate_type: 'participation' | 'winner' | 'runner_up' | 'special';
  certificate_url: string | null;
  certificate_number: string | null;
  issued_at: string;
  created_at: string;
  event?: Event;
}

export interface EventWinner {
  id: string;
  event_id: string;
  user_id: string;
  position: number;
  prize_details: string | null;
  created_at: string;
  event?: Event;
}

export interface Club {
  id: string;
  name: string;
  full_name: string;
  slug: string;
  college_name: string;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  gradient_from: string;
  gradient_via: string;
  gradient_to: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  tagline: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  linkedin_url: string | null;
  youtube_url: string | null;
  twitter_url: string | null;
  primary_domain: string | null;
  staging_domain: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClubAdmin {
  id: string;
  club_id: string;
  user_id: string;
  role: 'admin' | 'teacher';
  is_primary: boolean;
  created_at: string;
  club?: Club;
}

export interface Occasion {
  id: string;
  club_id: string | null;
  title: string;
  description: string | null;
  occasion_date: string | null;
  category: string;
  drive_folder_link: string | null;
  cover_image_url: string | null;
  is_active: boolean;
  position: number;
  created_at: string;
  updated_at: string;
}

export type AppRole = 'super_admin' | 'admin' | 'teacher' | 'student';
