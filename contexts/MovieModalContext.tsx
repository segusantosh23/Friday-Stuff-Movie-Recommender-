import React, { createContext, useState, ReactNode } from 'react';

interface MovieModalContextType {
  isModalOpen: boolean;
  selectedMovieId: number | null;
  openModal: (movieId: number) => void;
  closeModal: () => void;
}

export const MovieModalContext = createContext<MovieModalContextType | undefined>(undefined);

interface MovieModalProviderProps {
  children: ReactNode;
}

export const MovieModalProvider: React.FC<MovieModalProviderProps> = ({ children }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);

  const openModal = (movieId: number) => {
    window.scrollTo(0, 0); // Scroll to top when opening a new modal view
    setSelectedMovieId(movieId);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    // Delay clearing ID to allow for fade-out animation
    setTimeout(() => {
        setSelectedMovieId(null);
    }, 300);
  };

  return (
    <MovieModalContext.Provider value={{ isModalOpen, selectedMovieId, openModal, closeModal }}>
      {children}
    </MovieModalContext.Provider>
  );
};