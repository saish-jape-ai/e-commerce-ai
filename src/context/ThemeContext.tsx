import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeColor = 'rose' | 'blue' | 'green' | 'violet' | 'orange';
export type ThemeMode = 'light' | 'dark';
export type FontFamily = 'Afacad Flux' | 'Inter' | 'Roboto' | 'Playfair Display';

interface ThemeContextType {
  color: ThemeColor;
  mode: ThemeMode;
  font: FontFamily;
  setColor: (color: ThemeColor) => void;
  setMode: (mode: ThemeMode) => void;
  setFont: (font: FontFamily) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const COLOR_MAP: Record<ThemeColor, { primary: string, primaryForeground: string, ring: string, fashionCoral: string, accent: string }> = {
  rose: { primary: '346 100% 62%', primaryForeground: '0 0% 100%', ring: '346 100% 62%', fashionCoral: '346 100% 62%', accent: '346 100% 62%' },
  blue: { primary: '221.2 83.2% 53.3%', primaryForeground: '210 40% 98%', ring: '221.2 83.2% 53.3%', fashionCoral: '221.2 83.2% 53.3%', accent: '221.2 83.2% 53.3%' },
  green: { primary: '142.1 76.2% 36.3%', primaryForeground: '355.7 100% 97.3%', ring: '142.1 76.2% 36.3%', fashionCoral: '142.1 76.2% 36.3%', accent: '142.1 76.2% 36.3%' },
  violet: { primary: '262.1 83.3% 57.8%', primaryForeground: '210 40% 98%', ring: '262.1 83.3% 57.8%', fashionCoral: '262.1 83.3% 57.8%', accent: '262.1 83.3% 57.8%' },
  orange: { primary: '24.6 95% 53.1%', primaryForeground: '210 40% 98%', ring: '24.6 95% 53.1%', fashionCoral: '24.6 95% 53.1%', accent: '24.6 95% 53.1%' },
};

const MODE_MAP: Record<ThemeMode, { background: string, foreground: string, card: string, cardForeground: string, popover: string, popoverForeground: string, border: string, input: string, muted: string, mutedForeground: string, secondary: string, secondaryForeground: string }> = {
  light: {
    background: '0 0% 100%',
    foreground: '0 0% 13%',
    card: '0 0% 100%',
    cardForeground: '0 0% 13%',
    popover: '0 0% 100%',
    popoverForeground: '0 0% 13%',
    border: '0 0% 90%',
    input: '0 0% 90%',
    muted: '30 15% 95%',
    mutedForeground: '0 0% 45%',
    secondary: '30 20% 96%',
    secondaryForeground: '0 0% 13%',
  },
  dark: {
    background: '240 10% 4%',
    foreground: '0 0% 98%',
    card: '240 10% 4%',
    cardForeground: '0 0% 98%',
    popover: '240 10% 4%',
    popoverForeground: '0 0% 98%',
    border: '240 3.7% 15.9%',
    input: '240 3.7% 15.9%',
    muted: '240 3.7% 15.9%',
    mutedForeground: '240 5% 64.9%',
    secondary: '240 3.7% 15.9%',
    secondaryForeground: '0 0% 98%',
  }
};

const FONT_MAP: Record<FontFamily, string> = {
  'Afacad Flux': "'Afacad Flux', system-ui, -apple-system, sans-serif",
  'Inter': "'Inter', system-ui, -apple-system, sans-serif",
  'Roboto': "'Roboto', system-ui, -apple-system, sans-serif",
  'Playfair Display': "'Playfair Display', serif",
};

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [color, setColor] = useState<ThemeColor>(() => (localStorage.getItem('theme-color') as ThemeColor) || 'rose');
  const [mode, setMode] = useState<ThemeMode>(() => (localStorage.getItem('theme-mode') as ThemeMode) || 'light');
  const [font, setFont] = useState<FontFamily>(() => (localStorage.getItem('theme-font') as FontFamily) || 'Afacad Flux');

  useEffect(() => {
    const root = document.documentElement;

    const colorVars = COLOR_MAP[color];
    Object.entries(colorVars).forEach(([key, value]) => {
      // camelCase to kebab-case
      const cssKey = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
      root.style.setProperty(cssKey, value);
    });

    const modeVars = MODE_MAP[mode];
    Object.entries(modeVars).forEach(([key, value]) => {
      const cssKey = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
      root.style.setProperty(cssKey, value);
    });

    root.style.setProperty('--font-display', FONT_MAP[font]);
    root.style.setProperty('--font-body', FONT_MAP[font]);

    localStorage.setItem('theme-color', color);
    localStorage.setItem('theme-mode', mode);
    localStorage.setItem('theme-font', font);

  }, [color, mode, font]);

  // Handle Google Fonts injection if using other fonts
  useEffect(() => {
    if (font === 'Afacad Flux') return; // Already imported in index.css

    const existingLink = document.getElementById('theme-font-link');
    if (existingLink) existingLink.remove();

    const link = document.createElement('link');
    link.id = 'theme-font-link';
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${font.replace(' ', '+')}:wght@300;400;500;600;700&display=swap`;
    document.head.appendChild(link);
  }, [font]);

  return (
    <ThemeContext.Provider value={{ color, mode, font, setColor, setMode, setFont }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
