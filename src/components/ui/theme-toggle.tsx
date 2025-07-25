import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleTheme}
      className="cyber-border hover:cyber-glow bg-background/80 backdrop-blur-sm p-2"
      title={theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
    >
      {theme === 'dark' ? (
        <Sun className="w-4 h-4 text-accent transition-all duration-300" />
      ) : (
        <Moon className="w-4 h-4 text-primary transition-all duration-300" />
      )}
    </Button>
  );
};

export default ThemeToggle;