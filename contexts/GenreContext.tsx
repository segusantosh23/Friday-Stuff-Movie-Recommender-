import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { getGenreList } from '../services/tmdbService';
import { Genre } from '../types';

interface GenreContextType {
  genres: Genre[];
  getGenreNames: (genreIds: number[]) => string[];
}

export const GenreContext = createContext<GenreContextType | undefined>(undefined);

interface GenreProviderProps {
  children: ReactNode;
}

export const GenreProvider: React.FC<GenreProviderProps> = ({ children }) => {
  const [genres, setGenres] = useState<Genre[]>([]);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const genreData = await getGenreList();
        setGenres(genreData.genres);
      } catch (error) {
        console.error("Failed to fetch genres:", error);
      }
    };
    fetchGenres();
  }, []);
  
  const getGenreNames = (genreIds: number[]): string[] => {
    if (!genres.length || !genreIds) return [];
    return genreIds
      .map(id => genres.find(g => g.id === id)?.name)
      .filter((name): name is string => !!name);
  };

  return (
    <GenreContext.Provider value={{ genres, getGenreNames }}>
      {children}
    </GenreContext.Provider>
  );
};
