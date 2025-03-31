
import React, { createContext, useContext, useEffect, useState } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

type ThemeType = "light" | "dark" | "system";

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  dateFormat: string;
  setDateFormat: (format: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useLocalStorage<ThemeType>("ui-theme", "system");
  const [fontSize, setFontSizeState] = useLocalStorage("ui-font-size", 16);
  const [dateFormat, setDateFormatState] = useLocalStorage("ui-date-format", "MM/DD/YYYY");

  const setTheme = (theme: ThemeType) => {
    setThemeState(theme);
  };

  const setFontSize = (size: number) => {
    setFontSizeState(size);
    document.documentElement.style.fontSize = `${size / 16}rem`;
  };

  const setDateFormat = (format: string) => {
    setDateFormatState(format);
  };

  useEffect(() => {
    const root = window.document.documentElement;
    
    root.classList.remove("light", "dark");
    
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
    
    // Initialize font size
    document.documentElement.style.fontSize = `${fontSize / 16}rem`;
  }, [theme, fontSize]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        fontSize,
        setFontSize,
        dateFormat,
        setDateFormat
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
