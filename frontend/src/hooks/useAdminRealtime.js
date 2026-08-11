'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');

export default function useAdminRealtime(enabled = true) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled || !API_URL) return undefined;

    const socket = io(`${API_URL}/admin`, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    const refreshAdminData = () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'bookings'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'notifications'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'in-app-notification-summary'] });
    };

    socket.on('admin:booking-event', (event) => {
      refreshAdminData();
      if (event?.event === 'booking:new') toast.success('New booking received');
    });

    socket.on('admin:booking-summary', (summary) => {
      queryClient.setQueryData(['admin', 'realtime-summary'], summary);
    });

    return () => {
      socket.disconnect();
    };
  }, [enabled, queryClient]);
}
