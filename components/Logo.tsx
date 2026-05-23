
import React from 'react';
// Fix: Use namespace import for react-router-dom
import * as ReactRouterDOM from 'react-router-dom';

const Logo: React.FC<{ onClick?: () => void }> = ({ onClick }) => (
  <ReactRouterDOM.Link to="/home" className="group flex items-center space-x-3 text-slate-900 dark:text-white flex-shrink-0" onClick={onClick}>
    <div className="relative">
      <div className="absolute -inset-1.5 bg-blue-600/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="32"
        height="32"
        viewBox="0 0 24 24"
        className="relative z-10"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="clap-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#0891b2" />
          </linearGradient>
        </defs>
        
        {/* Hinge */}
        <circle cx="2.5" cy="5.5" r="1" fill="#1e40af"/>

        {/* Top Clapstick */}
        <g className="transition-transform duration-300 ease-in-out group-hover:-rotate-[20deg]" style={{transformOrigin: '2.5px 5.5px'}}>
            <path d="M1 3 H 23 L 22 8 H 0 Z" fill="url(#clap-grad)"/>
            {/* Stripes */}
            <path fill="white" fillOpacity="0.3" d="M4 3.5 L 6 3.5 L 5 8 L 3 8 Z"/>
            <path fill="white" fillOpacity="0.3" d="M9 3.5 L 11 3.5 L 10 8 L 8 8 Z"/>
            <path fill="white" fillOpacity="0.3" d="M14 3.5 L 16 3.5 L 15 8 L 13 8 Z"/>
            <path fill="white" fillOpacity="0.3" d="M19 3.5 L 21 3.5 L 20 8 L 18 8 Z"/>
        </g>

        {/* Bottom Board */}
        <path d="M0 9 H 24 V 21 C 24 21.5 23.5 22 23 22 H 1 C 0.5 22 0 21.5 0 21 V 9 Z" fill="url(#clap-grad)" />
        <g fill="white" fillOpacity="0.2">
            <rect x="3" y="12" width="18" height="0.5" rx="0.25" />
            <rect x="3" y="15" width="18" height="0.5" rx="0.25" />
            <rect x="3" y="18" width="14" height="0.5" rx="0.25" />
        </g>
      </svg>
    </div>

    <div className="flex flex-col -space-y-1.5 transition-all duration-300 group-hover:translate-x-1">
      <span className="text-2xl font-black tracking-tighter bg-gradient-to-r from-blue-600 via-blue-400 to-cyan-500 bg-clip-text text-transparent uppercase italic">
        FRIDAY
      </span>
      <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-slate-400 dark:text-slate-500 ml-0.5">
        STUFF
      </span>
    </div>
  </ReactRouterDOM.Link>
);

export default Logo;
