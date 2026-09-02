import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Booking, NotificationItem } from '../types';
import { apiService } from '../services/api';
import safeStorage, { StorageKeys } from '../services/storage';

interface BookingContextType {
  activeBooking: Booking | null;
  bookings: Booking[];
  notifications: NotificationItem[];
  unreadCount: number;
  isLoading: boolean;
  isOffline: boolean;
  refreshActiveBooking: () => Promise<void>;
  refreshAllBookings: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isOffline, setIsOffline] = useState<boolean>(false);

  const refreshActiveBooking = useCallback(async () => {
    try {
      const list = await apiService.getBookings();
      setBookings(list);
      
      // Find the first active or upcoming booking
      const active = list.find(b => b.status !== 'CANCELLED' && b.status !== 'COMPLETED') || list[0] || null;
      setActiveBooking(active);
      if (active) {
        await safeStorage.setItem(StorageKeys.CACHED_BOOKING, JSON.stringify(active));
      }
      setIsOffline(false);
    } catch (e) {
      console.log('Using cached booking data:', e);
      setIsOffline(true);
      const cached = await safeStorage.getItem(StorageKeys.CACHED_BOOKING);
      if (cached) {
        setActiveBooking(JSON.parse(cached));
      }
    }
  }, []);

  const refreshAllBookings = useCallback(async () => {
    setIsLoading(true);
    try {
      const list = await apiService.getBookings();
      setBookings(list);
      setIsOffline(false);
    } catch (e) {
      setIsOffline(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshNotifications = useCallback(async () => {
    try {
      const notifs = await apiService.getNotifications();
      setNotifications(notifs);
    } catch (e) {
      console.warn('Could not fetch notifications:', e);
    }
  }, []);

  const markAllNotificationsAsRead = async () => {
    try {
      await apiService.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (e) {
      console.warn('Could not mark all as read:', e);
    }
  };

  // Background live queue polling every 10 seconds when active booking exists
  useEffect(() => {
    refreshActiveBooking();
    refreshNotifications();

    const interval = setInterval(() => {
      refreshActiveBooking();
      refreshNotifications();
    }, 10000);

    return () => clearInterval(interval);
  }, [refreshActiveBooking, refreshNotifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <BookingContext.Provider
      value={{
        activeBooking,
        bookings,
        notifications,
        unreadCount,
        isLoading,
        isOffline,
        refreshActiveBooking,
        refreshAllBookings,
        refreshNotifications,
        markAllNotificationsAsRead,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = (): BookingContextType => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};
