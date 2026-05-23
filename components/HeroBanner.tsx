import React from 'react';
// Fix: Use namespace import for react-router-dom
import * as ReactRouterDOM from 'react-router-dom';
import { Movie } from '../types';
import { TMDB_IMAGE_BASE_URL } from '../constants';

interface HeroBannerProps {
  movie: Movie;
}

const HeroBanner: React.FC<HeroBannerProps> = ({ movie }) => {
  const backgroundImageUrl = `${TMDB_IMAGE_BASE_URL}${movie.backdrop_path}`;

  return (
    <div
      className="h-[60vh] md:h-[80vh] w-full bg-cover bg-center bg-no-repeat relative rounded-xl overflow-hidden"
      style={{ backgroundImage: `url(${backgroundImageUrl})` }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
      <div className="absolute bottom-0 left-0 p-8 md:p-12 text-white z-10 max-w-2xl">
        <h1 className="text-4xl md:text-6xl font-black mb-4 drop-shadow-lg">{movie.title || movie.name}</h1>
        <p className="text-lg mb-6 drop-shadow-md hidden md:block">{movie.overview}</p>
        <ReactRouterDOM.Link 
          to={`/movie/${movie.id}`}
          className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-black py-4 px-10 rounded-full text-lg transition-all transform hover:scale-105 shadow-xl shadow-blue-500/20 uppercase tracking-widest"
        >
          View Details
        </ReactRouterDOM.Link>
      </div>
    </div>
  );
};

export default HeroBanner;
