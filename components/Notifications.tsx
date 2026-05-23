import React, { useContext } from 'react';
import { NotificationContext } from '../contexts/NotificationContext';
import { Notification } from '../types';

const getNotificationStyle = (type: Notification['type']) => {
  switch (type) {
    case 'success':
      return {
        bg: 'bg-gradient-to-br from-blue-600 to-cyan-500',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        ),
      };
    case 'error':
      return {
        bg: 'bg-gradient-to-br from-red-600 to-rose-500',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        ),
      };
    case 'info':
      return {
        bg: 'bg-gradient-to-br from-slate-600 to-slate-500',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        ),
      };
    default:
      return {
        bg: 'bg-gradient-to-br from-blue-600 to-cyan-500',
        icon: null,
      };
  }
};


const Notifications: React.FC = () => {
  const context = useContext(NotificationContext);

  // If context is not available, render nothing. This could happen if the component
  // is rendered outside of the NotificationProvider.
  if (!context) {
    return null;
  }
  
  const { notifications } = context;
  
  return (
    <div className="fixed bottom-4 right-4 z-[100] w-auto max-w-sm space-y-3">
      {notifications.map(notification => {
        const { bg, icon } = getNotificationStyle(notification.type);
        return (
            <div
            key={notification.id}
            className={`toast-enter ${bg} text-white font-semibold py-3 px-5 rounded-xl shadow-2xl flex items-center space-x-3`}
            role="alert"
            >
            {icon}
            <p>{notification.message}</p>
            </div>
        );
      })}
    </div>
  );
};

export default Notifications;