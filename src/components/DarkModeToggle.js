'use client';
import { useEffect, useState } from 'react';

export default function DarkModeToggle() {
  const [dark, setDark] = useState(false);

  // Initialize from system preference or saved setting
  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved) {
      setDark(saved === 'dark');
      document.documentElement.dataset.theme = saved;
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDark(prefersDark);
      document.documentElement.dataset.theme = prefersDark ? 'dark' : 'light';
    }
  }, []);

  const toggle = () => {
    const newTheme = !dark;
    setDark(newTheme);
    document.documentElement.dataset.theme = newTheme ? 'dark' : 'light';
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  return (
    <button
      onClick={toggle}
      className="btn btn-secondary"
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {dark ? '🌞' : '🌙'}
    </button>
  );
}
