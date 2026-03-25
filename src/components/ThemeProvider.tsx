import React, { useEffect } from 'react';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    const root = document.documentElement;

    // Use values from .env or fallback to defaults
    const primary = import.meta.env.VITE_PRIMARY_COLOR || '#2563eb';
    const secondary = import.meta.env.VITE_SECONDARY_COLOR || '#60a5fa';
    const gradientFrom = import.meta.env.VITE_GRADIENT_FROM || '#f8fafc';
    const gradientVia = import.meta.env.VITE_GRADIENT_VIA || '#dbeafe';
    const gradientTo = import.meta.env.VITE_GRADIENT_TO || '#93c5fd';

    // Set the specific club theme variables
    root.style.setProperty('--club-primary', primary);
    root.style.setProperty('--club-secondary', secondary);
    root.style.setProperty('--club-gradient-from', gradientFrom);
    root.style.setProperty('--club-gradient-via', gradientVia);
    root.style.setProperty('--club-gradient-to', gradientTo);

    // Also override standard Tailwind colors directly so they work seamlessly with hex
    root.style.setProperty('--primary', primary);
    root.style.setProperty('--secondary', secondary);

  }, []);

  return <>{children}</>;
};
