
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-100 dark:bg-black/50 mt-8">
      <div className="container mx-auto px-4 py-6 text-center text-slate-500 dark:text-slate-400">
        <p>&copy; {new Date().getFullYear()} Friday Stuff. All Rights Reserved.</p>
        <p className="text-sm mt-2">Powered by React, Tailwind CSS, TMDB, and Gemini API.</p>
      </div>
    </footer>
  );
};

export default Footer;
