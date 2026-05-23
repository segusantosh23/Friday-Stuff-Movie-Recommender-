

import React, { createContext, ReactNode, useContext, useState, useEffect } from 'react';
import { Movie } from '../types';
import { AuthContext } from './AuthContext';
import { NotificationContext } from './NotificationContext';
import { db, handleFirestoreError, OperationType } from '../services/firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';

interface MovieListsContextType {
  likedMovies: Movie[];
  watchlist: Movie[];
  isLiked: (movieId: number) => boolean;
  isOnWatchlist: (movieId: number) => boolean;
  toggleLike: (movie: Movie) => Promise<void>;
  toggleWatchlist: (movie: Movie) => Promise<void>;
  loading: boolean;
}

export const MovieListsContext = createContext<MovieListsContextType | undefined>(undefined);

interface MovieListsProviderProps {
  children: ReactNode;
}

export const MovieListsProvider: React.FC<MovieListsProviderProps> = ({ children }) => {
  const authContext = useContext(AuthContext);
  const notificationContext = useContext(NotificationContext);
  const user = authContext?.user;

  const [likedMovies, setLikedMovies] = useState<Movie[]>([]);
  const [watchlist, setWatchlist] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setLikedMovies([]);
      setWatchlist([]);
      return;
    }

    setLoading(true);

    const likedQuery = query(collection(db, 'users', user.uid, 'likedMovies'), orderBy('addedAt', 'desc'));
    const unsubscribeLiked = onSnapshot(likedQuery, 
      (snapshot) => {
        setLikedMovies(snapshot.docs.map(doc => doc.data() as Movie));
        setLoading(false);
      },
      (error) => handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/likedMovies`)
    );

    const watchlistQuery = query(collection(db, 'users', user.uid, 'watchlist'), orderBy('addedAt', 'desc'));
    const unsubscribeWatchlist = onSnapshot(watchlistQuery, 
      (snapshot) => setWatchlist(snapshot.docs.map(doc => doc.data() as Movie)),
      (error) => handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/watchlist`)
    );

    return () => {
      unsubscribeLiked();
      unsubscribeWatchlist();
    };
  }, [user]);

  const isLiked = (movieId: number) => likedMovies.some(m => m.id === movieId);
  const isOnWatchlist = (movieId: number) => watchlist.some(m => m.id === movieId);

  const toggleLike = async (movie: Movie) => {
    if (!user) return;
    const title = movie.title || movie.name;
    const movieId = movie.id.toString();
    const docRef = doc(db, 'users', user.uid, 'likedMovies', movieId);

    try {
      if (isLiked(movie.id)) {
        await deleteDoc(docRef);
        notificationContext?.addNotification(`Removed "${title}" from liked movies.`);
      } else {
        await setDoc(docRef, {
          ...movie,
          addedAt: serverTimestamp()
        });
        notificationContext?.addNotification(`Added "${title}" to liked movies!`);
      }
    } catch (error) {
      handleFirestoreError(error, isLiked(movie.id) ? OperationType.DELETE : OperationType.CREATE, `users/${user.uid}/likedMovies/${movieId}`);
    }
  };

  const toggleWatchlist = async (movie: Movie) => {
    if (!user) return;
    const title = movie.title || movie.name;
    const movieId = movie.id.toString();
    const docRef = doc(db, 'users', user.uid, 'watchlist', movieId);

    try {
      if (isOnWatchlist(movie.id)) {
        await deleteDoc(docRef);
        notificationContext?.addNotification(`Removed "${title}" from your watchlist.`);
      } else {
        await setDoc(docRef, {
          ...movie,
          addedAt: serverTimestamp()
        });
        notificationContext?.addNotification(`Added "${title}" to your watchlist!`);
      }
    } catch (error) {
      handleFirestoreError(error, isOnWatchlist(movie.id) ? OperationType.DELETE : OperationType.CREATE, `users/${user.uid}/watchlist/${movieId}`);
    }
  };
  
  return (
    <MovieListsContext.Provider value={{ likedMovies, watchlist, isLiked, isOnWatchlist, toggleLike, toggleWatchlist, loading }}>
      {children}
    </MovieListsContext.Provider>
  );
};
