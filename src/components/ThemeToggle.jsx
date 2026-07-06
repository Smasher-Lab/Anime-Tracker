// src/components/ThemeToggle.jsx
import React from 'react';

function ThemeToggle({ theme, toggleTheme }) {
  return (
    <button onClick={toggleTheme} className="theme-toggle-button">
      {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
    </button>
  );
}

export default ThemeToggle;
