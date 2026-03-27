import { MainLayout } from '@/components/layout/MainLayout';
import { HeroSection } from '@/components/home/HeroSection';
import { ClubAdvantageSection } from '@/components/home/ClubAdvantageSection';
import { StatsSection } from '@/components/home/StatsSection';
import { FeaturesSection } from '@/components/home/FeaturesSection';
import { PartnersSlider } from '@/components/home/PartnersSlider';
import { AlumniSection } from '@/components/home/AlumniSection';
import { CTASection } from '@/components/home/CTASection';
import { PopupAnnouncement } from '@/components/home/PopupAnnouncement';
import { NoticePopup } from '@/components/home/NoticePopup';

const Index = () => {
  return (
    <MainLayout
      description="Official AISA Club website of ISBM College of Engineering, Pune. Explore upcoming events, notices, gallery, team, downloads, and more."
    >
      <PopupAnnouncement />
      <NoticePopup />
      <HeroSection />
      <ClubAdvantageSection />
      <StatsSection />
      <FeaturesSection />
      <PartnersSlider />
      <AlumniSection />
      <CTASection />
    </MainLayout>
  );
};

export default Index;
