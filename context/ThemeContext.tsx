import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// C# Analogy: Context API
// ----------------------------------------------------------------
// Context is like a Scoped Service in Dependency Injection.
// Anything inside the <ThemeProvider> can access this context without 
// passing props down manually.

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

// Create the definition/interface for the service
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

// The Provider Component
// C# Analogy: The Startup.cs / Program.cs service registration logic
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Initialize state with value from localStorage if available
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = window.localStorage.getItem('theme_preference');
      return (stored === 'dark' || stored === 'light') ? stored : 'light';
    }
    return 'light';
  });

  // Effect to apply the class to the <html> document element
  // This ensures Tailwind's 'darkMode: class' strategy works globally
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    // Persist to storage
    localStorage.setItem('theme_preference', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className="min-h-screen transition-colors duration-300 bg-gray-100 dark:bg-gray-900 dark:text-white">
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

// Custom Hook to consume the context
// C# Analogy: A helper method like `Resolve<IThemeService>()`
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};