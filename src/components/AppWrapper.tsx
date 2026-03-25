import { ReactNode } from 'react';
import { useDynamicFavicon } from '@/hooks/useDynamicFavicon';

interface AppWrapperProps {
  children: ReactNode;
}

export const AppWrapper = ({ children }: AppWrapperProps) => {
  useDynamicFavicon();
  return <>{children}</>;
};
