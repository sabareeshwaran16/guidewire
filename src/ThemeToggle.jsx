import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from './ThemeContext';

export default function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-xl transition-colors bg-bg-elevated border border-border-line text-text-sub hover:text-text-main hover:bg-bg-element flex items-center justify-center gap-2 ${className}`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'dark' ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-indigo-400" />}
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}
