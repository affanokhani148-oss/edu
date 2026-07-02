'use client';
import { useEffect } from 'react';

export default function SecurityEnforcer() {
  useEffect(() => {
    // 1. Prevent Right-Click (Context Menu)
    const handleContextMenu = (e) => {
      e.preventDefault();
    };

    // 2. Prevent Copy, Cut, Paste
    const handleCopy = (e) => {
      e.preventDefault();
    };

    // 3. Prevent Keyboard Shortcuts (Ctrl+C, Ctrl+P, Ctrl+S, F12, etc.)
    const handleKeyDown = (e) => {
      // Prevent F12 (DevTools)
      if (e.keyCode === 123) {
        e.preventDefault();
        return false;
      }
      
      // Prevent Ctrl+Shift+I (DevTools), Ctrl+Shift+J, Ctrl+U (View Source)
      if (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) {
        e.preventDefault();
        return false;
      }
      if (e.ctrlKey && e.keyCode === 85) {
        e.preventDefault();
        return false;
      }

      // Prevent Ctrl+S (Save), Cmd+S (Mac)
      if ((e.ctrlKey || e.metaKey) && e.keyCode === 83) {
        e.preventDefault();
        return false;
      }

      // Prevent Ctrl+P (Print), Cmd+P (Mac)
      if ((e.ctrlKey || e.metaKey) && e.keyCode === 80) {
        e.preventDefault();
        return false;
      }

      // Prevent Ctrl+C (Copy), Cmd+C (Mac), Ctrl+X (Cut)
      if ((e.ctrlKey || e.metaKey) && (e.keyCode === 67 || e.keyCode === 88)) {
        e.preventDefault();
        return false;
      }
    };

    // Attach Event Listeners
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('cut', handleCopy);
    document.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('cut', handleCopy);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return null; // This component does not render any UI
}
