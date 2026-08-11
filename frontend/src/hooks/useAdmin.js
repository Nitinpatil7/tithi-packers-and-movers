import { keepPreviousData, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getAdminStats, 
  getAdminAnalyticsOverview,
  getAllBookings, 
  updateBookingStatus, 
  updateBookingQuote, 
  getPricing, 
  updatePricingItem,
  getUsers,
  getNotifications,
  sendNotification,
  getInAppNotifications,
  getInAppNotificationSummary,
  markInAppNotificationRead,
  markAllInAppNotificationsRead
} from '@/lib/api';

export function useAdminStats(token) {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => getAdminStats(token),
    enabled: true,
  });
}

export function useAdminAnalyticsOverview() {
  return useQuery({
    queryKey: ['admin', 'analytics-overview'],
    queryFn: () => getAdminAnalyticsOverview(),
    enabled: true,
  });
}

export function useAllBookings(filters, token) {
  return useQuery({
    queryKey: ['admin', 'bookings', filters],
    queryFn: () => getAllBookings(filters, token),
    enabled: true,
    placeholderData: keepPreviousData,
  });
}

export function useUpdateBookingStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, note }) => updateBookingStatus(id, status, note || ''),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'bookings'] });
      queryClient.invalidateQueries({ queryKey: ['bookings', 'detail', variables.id] });
    },
  });
}

export function useUpdateBookingQuote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, quoteData, token }) => updateBookingQuote(id, quoteData, token),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'bookings'] });
      queryClient.invalidateQueries({ queryKey: ['bookings', 'detail', variables.id] });
    },
  });
}

export function usePricingData() {
  return useQuery({
    queryKey: ['admin', 'pricing'],
    queryFn: () => getPricing(),
  });
}

export function useUpdatePricingItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updateData, token }) => updatePricingItem(id, updateData, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'pricing'] });
    },
  });
}

export function useAdminUsers(filters = {}) {
  return useQuery({
    queryKey: ['admin', 'users', filters],
    queryFn: () => getUsers(filters),
    enabled: true,
    placeholderData: keepPreviousData,
  });
}

export function useNotifications(filters = {}) {
  return useQuery({
    queryKey: ['admin', 'notifications', filters],
    queryFn: () => getNotifications(filters),
    placeholderData: keepPreviousData,
  });
}

export function useSendNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: sendNotification,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'notifications'] }),
  });
}

export function useInAppNotifications(filters = {}) {
  return useQuery({
    queryKey: ['admin', 'in-app-notifications', filters],
    queryFn: () => getInAppNotifications(filters),
    placeholderData: keepPreviousData,
  });
}

export function useInAppNotificationSummary() {
  return useQuery({
    queryKey: ['admin', 'in-app-notification-summary'],
    queryFn: () => getInAppNotificationSummary(),
    refetchInterval: 60000,
  });
}

export function useMarkInAppNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markInAppNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'in-app-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'in-app-notification-summary'] });
    },
  });
}

export function useMarkAllInAppNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markAllInAppNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'in-app-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'in-app-notification-summary'] });
    },
  });
}
