import { MainLayout } from '@/components/layout/MainLayout';
import { HeroSection } from '@/components/home/HeroSection';
import { ClubAdvantageSection } from '@/components/home/ClubAdvantageSection';
import { StatsSection } from '@/components/home/StatsSection';
import { FeaturesSection } from '@/components/home/FeaturesSection';
import { PartnersSlider } from '@/components/home/PartnersSlider';
import { AlumniSection } from '@/components/home/AlumniSection';
import { CTASection } from '@/components/home/CTASection';
import { PopupAnnouncement } from '@/components/home/PopupAnnouncement';

const Index = () => {
  return (
    <MainLayout>
      <PopupAnnouncement />
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
