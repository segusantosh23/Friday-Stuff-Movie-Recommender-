import React, { useContext } from 'react';
// Fix: Use namespace import for react-router-dom
import * as ReactRouterDOM from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import Spinner from './Spinner';

interface ProtectedRouteProps {
  // Fix: Use React.ReactElement to resolve "Cannot find namespace 'JSX'" error.
  children: React.ReactElement;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const authContext = useContext(AuthContext);

  if (authContext?.loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-black transition-colors duration-300">
        <Spinner size="lg" />
        <p className="mt-4 text-slate-400 font-medium">Loading session...</p>
      </div>
    );
  }

  if (!authContext?.user) {
    return <ReactRouterDOM.Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;