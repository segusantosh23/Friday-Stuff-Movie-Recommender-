
import React, { useState, useContext, useRef, useEffect } from 'react';
// Fix: Use namespace import for react-router-dom
import * as ReactRouterDOM from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { ThemeContext } from '../contexts/ThemeContext';
import Logo from './Logo';
import { Movie } from '../types';
import { searchMovies } from '../services/tmdbService';

const Navbar: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Movie[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isThemeToggleClicked, setIsThemeToggleClicked] = useState(false);
  
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const mobileSearchContainerRef = useRef<HTMLDivElement>(null);

  const navigate = ReactRouterDOM.useNavigate();
  const authContext = useContext(AuthContext);
  const themeContext = useContext(ThemeContext);
  const location = ReactRouterDOM.useLocation();
  const { pathname } = location;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
      // Close suggestions if clicked outside of both desktop and mobile search containers
      const isOutsideDesktop = searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node);
      const isOutsideMobile = mobileSearchContainerRef.current && !mobileSearchContainerRef.current.contains(event.target as Node);
      
      if (isOutsideDesktop && (!mobileSearchContainerRef.current || isOutsideMobile)) {
         setSuggestions([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileMenuRef]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSuggestions([]);
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      const fetchSuggestions = async () => {
        try {
          const response = await searchMovies(searchQuery);
          setSuggestions(response.results.slice(0, 5));
        } catch (error) {
          console.error("Failed to fetch search suggestions:", error);
          setSuggestions([]);
        }
      };
      fetchSuggestions();
    }, 300); // 300ms debounce delay

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);


  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search/${searchQuery.trim()}`);
      setSearchQuery('');
      setSuggestions([]);
      setIsMobileMenuOpen(false); // Close menu on search
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSuggestions([]);
  };
  
  const handleSuggestionClick = (movieId: number) => {
    navigate(`/movie/${movieId}`);
    setSearchQuery('');
    setSuggestions([]);
    setIsMobileMenuOpen(false);
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const handleLogout = () => {
    authContext?.logout();
    navigate('/');
    setIsProfileMenuOpen(false);
    closeMobileMenu();
  };

  const handleThemeToggle = () => {
    if (themeContext) {
      themeContext.toggleTheme();
      setIsThemeToggleClicked(true);
      setTimeout(() => setIsThemeToggleClicked(false), 500); // Highlight duration
    }
  };

  const navLinks = [
    { to: '/home', label: 'Home' },
    { to: '/trending', label: 'Trending' },
    { to: '/ai-recommender', label: 'AI Recommender' },
    { to: '/liked', label: 'Liked' },
    { to: '/watchlist', label: 'Watchlist' },
  ];

  const getLinkClassName = (path: string, baseClasses: string) => {
    const activeClasses = 'bg-gradient-to-r from-blue-600/10 to-cyan-500/10 text-blue-600 dark:text-cyan-400 font-black border border-blue-500/20 shadow-sm';
    const inactiveClasses = 'text-slate-500 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white';
    return `${baseClasses} ${pathname === path ? activeClasses : inactiveClasses}`;
  };

  const renderSuggestions = () => (
    suggestions.length > 0 && (
      <div className="absolute top-full mt-2 w-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-20 overflow-hidden">
        <ul>
          {suggestions.map(movie => (
            <li 
              key={movie.id} 
              onClick={() => handleSuggestionClick(movie.id)}
              className="px-4 py-3 flex items-center space-x-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <img 
                src={movie.poster_path ? `https://image.tmdb.org/t/p/w92${movie.poster_path}` : `https://picsum.photos/50/75?random=${movie.id}`} 
                alt={movie.title} 
                className="w-12 aspect-[2/3] object-cover rounded flex-shrink-0 bg-slate-200 dark:bg-slate-700"
              />
              <div>
                <p className="font-semibold text-slate-900 dark:text-white line-clamp-2">{movie.title || movie.name}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{movie.release_date?.substring(0, 4)}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    )
  );

  return (
    <nav className="bg-white/80 dark:bg-black/60 backdrop-blur-lg sticky top-0 z-50 border-b border-slate-200/50 dark:border-slate-800/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left side: Logo and Desktop Nav */}
          <div className="flex items-center space-x-8">
            <Logo onClick={closeMobileMenu} />
            <div className="hidden lg:flex items-center gap-2">
              {navLinks.map((link) => (
                <ReactRouterDOM.Link key={link.to} to={link.to} className={getLinkClassName(link.to, 'h-10 px-4 flex items-center rounded-lg text-sm font-medium transition-all duration-300 whitespace-nowrap')}>
                  {link.label}
                </ReactRouterDOM.Link>
              ))}
            </div>
          </div>

          {/* Right side: Search, Auth, and Mobile Menu Button */}
          <div className="flex items-center gap-3">
            <div ref={searchContainerRef} className="hidden sm:block relative sm:w-80 lg:w-[36rem]">
              <form onSubmit={handleSearch} className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for a movie..."
                  className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 border border-slate-200 dark:border-slate-700 rounded-lg pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent w-full transition-all duration-300 h-10"
                  autoComplete="off"
                />
                {searchQuery && (
                  <button 
                    type="button" 
                    onClick={handleClearSearch}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white" 
                    aria-label="Clear search"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </form>
              {renderSuggestions()}
            </div>
            
            <button
                onClick={handleThemeToggle}
                className={`h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 focus:outline-none transition-all duration-300 ${isThemeToggleClicked ? 'ring-2 ring-cyan-400' : 'ring-transparent'}`}
                aria-label="Toggle theme"
              >
                {themeContext?.theme === 'dark' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>

            <div className="hidden lg:flex items-center">
              {authContext?.user ? (
                <div className="relative" ref={profileMenuRef}>
                  <button onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} className="flex items-center space-x-2 text-slate-900 dark:text-white px-3 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-all h-10 border border-transparent hover:border-blue-500/20">
                    {authContext.user.profilePicture ? (
                        <img src={authContext.user.profilePicture} alt={authContext.user.username} className="h-8 w-8 rounded-full" />
                    ) : (
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center font-black text-[10px] text-white uppercase tracking-tighter">
                        {authContext.user.username.charAt(0)}
                        </div>
                    )}
                    <span className="text-xs font-black uppercase tracking-widest hidden lg:block">{authContext.user.username}</span>
                    <svg className="w-4 h-4 text-slate-500 dark:text-slate-400 hidden lg:block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </button>
                  {isProfileMenuOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-2xl shadow-xl py-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 focus:outline-none z-10" role="menu" aria-orientation="vertical" aria-labelledby="user-menu-button" tabIndex={-1}>
                      <ReactRouterDOM.Link to="/profile" onClick={() => setIsProfileMenuOpen(false)} className="block px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-cyan-400" role="menuitem" tabIndex={-1}>
                        Your Profile
                      </ReactRouterDOM.Link>
                      <button onClick={handleLogout} className="w-full text-left block px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-red-500" role="menuitem" tabIndex={-1}>
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <ReactRouterDOM.Link to="/" className="h-10 flex items-center justify-center bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-black px-6 rounded-xl text-xs uppercase tracking-[0.2em] transition-all transform hover:scale-105 shadow-lg shadow-blue-500/20">Login</ReactRouterDOM.Link>
              )}
            </div>
            {/* Mobile menu button */}
            <div className="lg:hidden flex items-center">
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} type="button" className="h-10 w-10 flex items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none" aria-controls="mobile-menu" aria-expanded={isMobileMenuOpen}>
                <span className="sr-only">Open main menu</span>
                <svg className={`${isMobileMenuOpen ? 'hidden' : 'block'} h-6 w-6`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <svg className={`${isMobileMenuOpen ? 'block' : 'hidden'} h-6 w-6`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                </button>
            </div>
          </div>
        </div>
      </div>

       {/* Mobile menu, show/hide based on menu state. */}
      <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} lg:hidden border-t border-slate-200 dark:border-slate-700/50`} id="mobile-menu">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
                <ReactRouterDOM.Link key={link.to} to={link.to} onClick={closeMobileMenu} className={getLinkClassName(link.to, 'block px-3 py-2 rounded-md text-base font-medium transition-all duration-300')}>
                    {link.label}
                </ReactRouterDOM.Link>
            ))}
             {authContext?.user && (
                 <ReactRouterDOM.Link to="/profile" onClick={closeMobileMenu} className={getLinkClassName('/profile', 'block px-3 py-2 rounded-md text-base font-medium transition-all duration-300')}>
                    Your Profile
                </ReactRouterDOM.Link>
            )}
        </div>
        <div className="pt-4 pb-3 border-t border-slate-200 dark:border-slate-700">
          <div ref={mobileSearchContainerRef} className="px-5 sm:px-3 mb-3 relative">
             <form onSubmit={handleSearch} className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for a movie..."
                  className="h-10 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 border border-slate-200 dark:border-slate-700 rounded-lg pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent w-full"
                  autoComplete="off"
                />
                {searchQuery && (
                  <button 
                    type="button" 
                    onClick={handleClearSearch}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white" 
                    aria-label="Clear search"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
            </form>
            {renderSuggestions()}
          </div>
          {authContext?.user ? (
            <div className="flex items-center px-5 sm:px-3">
              <div className="flex-shrink-0">
                  {authContext.user.profilePicture ? (
                      <img src={authContext.user.profilePicture} alt={authContext.user.username} className="h-10 w-10 rounded-full" />
                  ) : (
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center font-black text-white px-2">
                          {authContext.user.username.charAt(0)}
                      </div>
                  )}
              </div>
              <div className="ml-3">
                <div className="text-base font-black text-slate-800 dark:text-white uppercase tracking-widest">{authContext.user.username}</div>
              </div>
              <button onClick={handleLogout} className="ml-auto bg-slate-200 dark:bg-slate-700 flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 hover:text-red-500 focus:outline-none transition-colors">
                <span className="sr-only">Logout</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="px-2 sm:px-3">
                <ReactRouterDOM.Link to="/" onClick={closeMobileMenu} className="block w-full text-center bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-black h-12 flex items-center justify-center rounded-xl text-base uppercase tracking-widest shadow-lg shadow-blue-500/20">Login</ReactRouterDOM.Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
