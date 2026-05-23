import React, { useRef, useState, useEffect } from 'react';
import { Movie } from '../types';
import MovieCard from './MovieCard';

interface CarouselProps {
  title: string;
  movies: Movie[];
}

const Carousel: React.FC<CarouselProps> = ({ title, movies }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isAtStart, setIsAtStart] = useState(true);
  const [isAtEnd, setIsAtEnd] = useState(false);

  const checkScrollPosition = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setIsAtStart(scrollLeft < 5); // A small tolerance
      // Add a small tolerance (e.g., 5px) for floating point inaccuracies
      setIsAtEnd(scrollLeft + clientWidth >= scrollWidth - 5);
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      // Use a ResizeObserver for more robust checking
      const observer = new ResizeObserver(() => {
        checkScrollPosition();
      });
      observer.observe(container);

      checkScrollPosition(); // Initial check
      container.addEventListener('scroll', checkScrollPosition, { passive: true });
      
      return () => {
        observer.disconnect();
        container.removeEventListener('scroll', checkScrollPosition);
      };
    }
  }, [movies]); // Re-check when movies change or on resize

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { clientWidth } = scrollContainerRef.current;
      // Scroll by 80% of the visible width for a nice page-like effect
      const scrollAmount = clientWidth * 0.8; 
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };
  
  // Don't render the component if there are no movies
  if (!movies || movies.length === 0) {
    return null;
  }

  return (
    <section className="relative group">
      <div className="flex items-center space-x-3 mb-8">
         <div className="w-1.5 h-10 bg-blue-500 rounded-full"></div>
         <h2 className="text-3xl font-black text-slate-950 dark:text-white uppercase tracking-tight">{title}</h2>
      </div>
      
      {!isAtStart && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/80 text-white p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          aria-label="Scroll left"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      <div
        ref={scrollContainerRef}
        className="flex overflow-x-auto space-x-4 md:space-x-6 pb-4 -mx-4 px-4 scrollbar-hide"
        style={{ scrollBehavior: 'smooth' }}
      >
        {movies.map(movie => (
          <div key={movie.id} className="flex-shrink-0 w-40 sm:w-48">
            <MovieCard movie={movie} />
          </div>
        ))}
      </div>
      
      {!isAtEnd && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/80 text-white p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          aria-label="Scroll right"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}
    </section>
  );
};

export default Carousel;