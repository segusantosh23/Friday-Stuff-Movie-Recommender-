import React from 'react';
// Fix: Use namespace import for react-router-dom
import * as ReactRouterDOM from 'react-router-dom';

const BackButton: React.FC = () => {
  const navigate = ReactRouterDOM.useNavigate();

  const goBack = () => {
    // Use the navigate hook from react-router-dom for reliable history navigation.
    navigate(-1);
  };

  return (
    <button
      onClick={goBack}
      className="mb-8 flex items-center space-x-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-semibold transition-colors duration-300 group focus:outline-none"
      aria-label="Go back to previous page"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24" stroke="currentColor" strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
      <span>Back</span>
    </button>
  );
};

export default BackButton;
