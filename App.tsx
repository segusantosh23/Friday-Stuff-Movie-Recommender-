
import React from 'react';
// Fix: Use namespace import for react-router-dom
import * as ReactRouterDOM from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { MovieListsProvider } from './contexts/MovieListsContext';
import { GenreProvider } from './contexts/GenreContext';
import { MovieModalProvider } from './contexts/MovieModalContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ThemeProvider } from './contexts/ThemeContext';

import Home from './pages/Home';
import Trending from './pages/Trending';
import Liked from './pages/Liked';
import Watchlist from './pages/Watchlist';
import SearchResults from './pages/SearchResults';
import AiRecommender from './pages/AiRecommender';
import Auth from './pages/Auth';
import ProtectedRoute from './components/ProtectedRoute';
import Profile from './pages/Profile';
import PersonDetail from './pages/PersonDetail';
import MovieDetail from './pages/MovieDetail';
import MainLayout from './components/MainLayout';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <MovieListsProvider>
            <GenreProvider>
              <MovieModalProvider>
                <ReactRouterDOM.HashRouter>
                  <ReactRouterDOM.Routes>
                    <ReactRouterDOM.Route path="/" element={<Auth />} />
                    <ReactRouterDOM.Route element={<MainLayout />}>
                      <ReactRouterDOM.Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                      <ReactRouterDOM.Route path="/trending" element={<Trending />} />
                      <ReactRouterDOM.Route path="/ai-recommender" element={<AiRecommender />} />
                      <ReactRouterDOM.Route path="/liked" element={<ProtectedRoute><Liked /></ProtectedRoute>} />
                      <ReactRouterDOM.Route path="/watchlist" element={<ProtectedRoute><Watchlist /></ProtectedRoute>} />
                      <ReactRouterDOM.Route path="/search/:query" element={<SearchResults />} />
                      <ReactRouterDOM.Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                      <ReactRouterDOM.Route path="/movie/:id" element={<MovieDetail />} />
                      <ReactRouterDOM.Route path="/person/:id" element={<PersonDetail />} />
                    </ReactRouterDOM.Route>
                  </ReactRouterDOM.Routes>
                </ReactRouterDOM.HashRouter>
              </MovieModalProvider>
            </GenreProvider>
          </MovieListsProvider>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
