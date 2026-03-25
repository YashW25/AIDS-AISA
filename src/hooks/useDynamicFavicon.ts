import { useEffect } from 'react';
import { useSiteSettings } from '@/hooks/useSiteData';

export const useDynamicFavicon = () => {
  const { data: settings } = useSiteSettings();

  useEffect(() => {
    if (settings?.logo_url) {
      const link = document.querySelector("link[rel='icon']") as HTMLLinkElement;
      if (link) {
        link.href = settings.logo_url;
      }
      const appleLink = document.querySelector("link[rel='apple-touch-icon']") as HTMLLinkElement;
      if (appleLink) {
        appleLink.href = settings.logo_url;
      }
    }

  }, [settings?.logo_url]);
};
