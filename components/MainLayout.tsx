import React from 'react';
// Fix: Use namespace import for react-router-dom
import * as ReactRouterDOM from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import MovieModal from './MovieModal';
import Notifications from './Notifications';
import ScrollToTopButton from './ScrollToTopButton';

const MainLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen text-slate-800 dark:text-slate-200 bg-white dark:bg-black transition-colors duration-300">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8 page-fade-in">
        <ReactRouterDOM.Outlet />
      </main>
      <Footer />
      <MovieModal />
      <Notifications />
      <ScrollToTopButton />
    </div>
  );
};

export default MainLayout;
