import React, { createContext, useContext, ReactNode } from 'react';

interface ClubContextType {
  club: null;
  clubId: string | null;
  loading: boolean;
  error: string | null;
  isSuspended: boolean;
  refetchClub: () => Promise<void>;
}

const ClubContext = createContext<ClubContextType>({
  club: null,
  clubId: null,
  loading: false,
  error: null,
  isSuspended: false,
  refetchClub: async () => {},
});

export const ClubProvider = ({ children }: { children: ReactNode }) => {
  return (
    <ClubContext.Provider value={{ 
      club: null, 
      clubId: null, 
      loading: false, 
      error: null,
      isSuspended: false,
      refetchClub: async () => {} 
    }}>
      {children}
    </ClubContext.Provider>
  );
};

export const useClub = (): ClubContextType => {
  return useContext(ClubContext);
};

// Backward compatible hook - returns site_settings data from the site_settings table
export const useClubSettings = () => {
  // This is now unused but kept for compatibility - components should use useSiteData instead
  return { data: null, isLoading: false, error: null };
};
