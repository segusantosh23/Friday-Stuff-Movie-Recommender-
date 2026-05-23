import React, { createContext, useState, ReactNode, useCallback, useContext } from 'react';
import { Notification } from '../types';

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now() + Math.random();
    setNotifications(prev => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000); // Notifications disappear after 3 seconds
  }, []);

  const value = { notifications, addNotification };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};