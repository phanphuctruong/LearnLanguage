import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeMode } from '../types';

export interface ThemeStyles {
  id: ThemeMode;
  name: string;
  icon: string;
  bgApp: string;
  bgCard: string;
  bgCardSubtle: string;
  bgElevated: string;
  bgInput: string;
  border: string;
  borderFocus: string;
  borderAccent: string;
  textPrimary: string;
  textSecondary: string;
  textLight: string;
  textHeading: string;
  btnPrimary: string;
  btnSecondary: string;
  badgeAccent: string;
  translitBg: string;
  translitText: string;
  accentColor: string;
  accentText: string;
}

export const THEMES: Record<ThemeMode, ThemeStyles> = {
  'navy-orange': {
    id: 'navy-orange',
    name: 'Xanh Navi & Cam',
    icon: '🍊',
    bgApp: 'bg-[#0B132B]',
    bgCard: 'bg-[#0E1A34]',
    bgCardSubtle: 'bg-[#132240]',
    bgElevated: 'bg-[#192A4D]',
    bgInput: 'bg-[#080E1E]',
    border: 'border-[#1E3A5F]',
    borderFocus: 'focus:border-[#F97316]',
    borderAccent: 'border-[#F97316]',
    textPrimary: 'text-[#FB923C]',
    textSecondary: 'text-[#FDBA74]',
    textLight: 'text-[#FED7AA]',
    textHeading: 'text-[#FFF7ED]',
    btnPrimary: 'bg-[#F97316] hover:bg-[#EA580C] text-[#0B132B] shadow-orange-500/20 border-2 border-[#FB923C]',
    btnSecondary: 'bg-[#132240] hover:bg-[#1C325B] text-[#FED7AA] hover:text-[#FB923C] border border-[#1E3A5F]',
    badgeAccent: 'bg-[#F97316]/15 text-[#FB923C] border border-[#F97316]/30',
    translitBg: 'bg-[#192A4D] border-[#F97316]',
    translitText: 'text-[#FF7A00]',
    accentColor: '#F97316',
    accentText: '#FB923C',
  },
  'black-gold': {
    id: 'black-gold',
    name: 'Đen & Vàng Gold',
    icon: '✨',
    bgApp: 'bg-[#090A0F]',
    bgCard: 'bg-[#12141D]',
    bgCardSubtle: 'bg-[#191C28]',
    bgElevated: 'bg-[#222738]',
    bgInput: 'bg-[#06070A]',
    border: 'border-[#2D3245]',
    borderFocus: 'focus:border-[#F59E0B]',
    borderAccent: 'border-[#F59E0B]',
    textPrimary: 'text-[#FBBF24]',
    textSecondary: 'text-[#FDE68A]',
    textLight: 'text-[#FEF3C7]',
    textHeading: 'text-[#FFFDF5]',
    btnPrimary: 'bg-[#F59E0B] hover:bg-[#D97706] text-[#090A0F] shadow-amber-500/20 border-2 border-[#FBBF24]',
    btnSecondary: 'bg-[#191C28] hover:bg-[#252A3B] text-[#FEF3C7] hover:text-[#FBBF24] border border-[#2D3245]',
    badgeAccent: 'bg-[#F59E0B]/15 text-[#FBBF24] border border-[#F59E0B]/30',
    translitBg: 'bg-[#222738] border-[#F59E0B]',
    translitText: 'text-[#FBBF24]',
    accentColor: '#F59E0B',
    accentText: '#FBBF24',
  },
};

interface ThemeContextType {
  theme: ThemeMode;
  styles: ThemeStyles;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem('lingoviet_theme');
      if (saved === 'black-gold' || saved === 'navy-orange') {
        return saved;
      }
    } catch {
      // Fallback
    }
    return 'navy-orange';
  });

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('lingoviet_theme', newTheme);
    } catch {
      // Ignore
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'navy-orange' ? 'black-gold' : 'navy-orange');
  };

  useEffect(() => {
    // Update body background color class based on theme
    const body = document.body;
    if (theme === 'black-gold') {
      body.className = 'bg-[#090A0F] text-[#FBBF24] antialiased selection:bg-[#F59E0B] selection:text-[#090A0F]';
    } else {
      body.className = 'bg-[#0B132B] text-[#FB923C] antialiased selection:bg-[#F97316] selection:text-[#0B132B]';
    }
  }, [theme]);

  const value = {
    theme,
    styles: THEMES[theme],
    setTheme,
    toggleTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
