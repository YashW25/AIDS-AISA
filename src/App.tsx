import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import { ClubProvider } from "@/contexts/ClubContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AppWrapper } from "@/components/AppWrapper";
import { ScrollToTop } from "@/components/ScrollToTop";
import Index from "./pages/Index";
import About from "./pages/About";
import Events from "./pages/Events";
import EventDetail from "./pages/EventDetail";
import Team from "./pages/Team";
import Gallery from "./pages/Gallery";
import Partners from "./pages/Partners";
import Charter from "./pages/Charter";
import Downloads from "./pages/Downloads";
import Notice from "./pages/Notice";
import Certificates from "./pages/Certificates";
import Contact from "./pages/Contact";
import Auth from "./pages/Auth";
import AdminAuth from "./pages/auth/AdminAuth";

import EventRegister from "./pages/EventRegister";
import AdminDashboard from "./pages/admin/Dashboard";
import Overview from "./pages/admin/Overview";
import SiteSettingsPage from "./pages/admin/SiteSettingsPage";
import AnnouncementsPage from "./pages/admin/AnnouncementsPage";
import HeroSlidesPage from "./pages/admin/HeroSlidesPage";
import FeaturesPage from "./pages/admin/FeaturesPage";
import StatsPage from "./pages/admin/StatsPage";
import EventsPage from "./pages/admin/EventsPage";
import TeamPage from "./pages/admin/TeamPage";
import TeamCategoriesPage from "./pages/admin/TeamCategoriesPage";
import GalleryPage from "./pages/admin/GalleryPage";
import PartnersPage from "./pages/admin/PartnersPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import ProfilePage from "./pages/admin/ProfilePage";
import RegistrationsPage from "./pages/admin/RegistrationsPage";
import CertificatesPage from "./pages/admin/CertificatesPage";
import PopupAnnouncementsPage from "./pages/admin/PopupAnnouncementsPage";
import AlumniPage from "./pages/admin/AlumniPage";
import CharterPage from "./pages/admin/CharterPage";
import NewsPage from "./pages/admin/NewsPage";
import DownloadsPage from "./pages/admin/DownloadsPage";
import OccasionsPage from "./pages/admin/OccasionsPage";
import ContactSubmissionsPage from "./pages/admin/ContactSubmissionsPage";
import NotFound from "./pages/NotFound";
import NavItemsPage from "./pages/admin/NavItemsPage";
import CustomPagesPage from "./pages/admin/CustomPagesPage";
import CustomPage from "./pages/CustomPage";


const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <ClubProvider>
            <AuthProvider>
              <Toaster />
            <Sonner />
            <BrowserRouter>
              <ScrollToTop />
              <AppWrapper>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/about" element={<About />} />
                <Route path="/partners" element={<Partners />} />
                <Route path="/charter" element={<Charter />} />
                <Route path="/downloads" element={<Downloads />} />
                <Route path="/notice" element={<Notice />} />
                <Route path="/events" element={<Events />} />
                <Route path="/event/:eventId" element={<EventDetail />} />
                <Route path="/team" element={<Team />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/certificates" element={<Certificates />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/auth/admin" element={<AdminAuth />} />
                
                <Route path="/dashboard" element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="/event/:eventId/register" element={<EventRegister />} />
                <Route path="/page/:slug" element={<CustomPage />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />}>
                  <Route index element={<Overview />} />
                  <Route path="settings" element={<SiteSettingsPage />} />
                  <Route path="announcements" element={<AnnouncementsPage />} />
                  <Route path="popups" element={<PopupAnnouncementsPage />} />
                  <Route path="slides" element={<HeroSlidesPage />} />
                  <Route path="features" element={<FeaturesPage />} />
                  <Route path="stats" element={<StatsPage />} />
                  <Route path="events" element={<EventsPage />} />
                  <Route path="team" element={<TeamPage />} />
                  <Route path="team-categories" element={<TeamCategoriesPage />} />
                  <Route path="gallery" element={<GalleryPage />} />
                  <Route path="occasions" element={<OccasionsPage />} />
                  <Route path="partners" element={<PartnersPage />} />
                  <Route path="alumni" element={<AlumniPage />} />
                  <Route path="charter" element={<CharterPage />} />
                  <Route path="news" element={<NewsPage />} />
                  <Route path="downloads" element={<DownloadsPage />} />
                  <Route path="contact" element={<ContactSubmissionsPage />} />
                  <Route path="admins" element={<AdminUsersPage />} />
                  <Route path="registrations" element={<RegistrationsPage />} />
                  <Route path="certificates" element={<CertificatesPage />} />
                  <Route path="profile" element={<ProfilePage />} />
                  <Route path="navigation" element={<NavItemsPage />} />
                  <Route path="pages" element={<CustomPagesPage />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
              </AppWrapper>
            </BrowserRouter>
            </AuthProvider>
          </ClubProvider>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
