import { keepPreviousData, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getAdminStats, 
  getAdminAnalyticsOverview,
  getAllBookings, 
  getBookingsByPhone,
  updateBookingStatus, 
  updateBookingQuote, 
  getPricing, 
  updatePricingItem,
  getUsers,
  getNotifications,
  getNotificationTemplates,
  sendNotification,
  updateNotificationTemplate,
  getInAppNotifications,
  getInAppNotificationSummary,
  markInAppNotificationRead,
  markAllInAppNotificationsRead
} from '@tithi/lib/api';

const ADMIN_LIVE_STALE_TIME = 30 * 1000;
const ADMIN_LIST_STALE_TIME = 60 * 1000;
const ADMIN_REFERENCE_STALE_TIME = 10 * 60 * 1000;
const ADMIN_GC_TIME = 30 * 60 * 1000;

const adminLiveQueryOptions = {
  staleTime: ADMIN_LIVE_STALE_TIME,
  gcTime: ADMIN_GC_TIME,
  refetchOnMount: false,
};

const adminListQueryOptions = {
  staleTime: ADMIN_LIST_STALE_TIME,
  gcTime: ADMIN_GC_TIME,
  refetchOnMount: false,
};

const adminReferenceQueryOptions = {
  staleTime: ADMIN_REFERENCE_STALE_TIME,
  gcTime: ADMIN_GC_TIME,
  refetchOnMount: false,
};

export function useAdminStats(token) {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => getAdminStats(token),
    enabled: true,
    ...adminLiveQueryOptions,
  });
}

export function useAdminAnalyticsOverview() {
  return useQuery({
    queryKey: ['admin', 'analytics-overview'],
    queryFn: () => getAdminAnalyticsOverview(),
    enabled: true,
    ...adminListQueryOptions,
  });
}

export function useAllBookings(filters, token, options = {}) {
  return useQuery({
    queryKey: ['admin', 'bookings', filters],
    queryFn: () => getAllBookings(filters, token),
    enabled: true,
    placeholderData: keepPreviousData,
    ...adminListQueryOptions,
    ...options,
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
    ...adminReferenceQueryOptions,
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
    ...adminListQueryOptions,
  });
}

export function useAdminBookingsByPhone(phoneNumber, options = {}) {
  return useQuery({
    queryKey: ['admin', 'bookings', 'by-phone', phoneNumber],
    queryFn: () => getBookingsByPhone(phoneNumber),
    enabled: Boolean(phoneNumber),
    placeholderData: keepPreviousData,
    ...adminListQueryOptions,
    ...options,
  });
}

export function useNotifications(filters = {}) {
  return useQuery({
    queryKey: ['admin', 'notifications', filters],
    queryFn: () => getNotifications(filters),
    placeholderData: keepPreviousData,
    ...adminListQueryOptions,
  });
}

export function useSendNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: sendNotification,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'notifications'] }),
  });
}

export function useNotificationTemplates() {
  return useQuery({
    queryKey: ['admin', 'notification-templates'],
    queryFn: getNotificationTemplates,
    placeholderData: keepPreviousData,
    ...adminReferenceQueryOptions,
  });
}

export function useUpdateNotificationTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ status, data }) => updateNotificationTemplate(status, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'notification-templates'] }),
  });
}

export function useInAppNotifications(filters = {}) {
  return useQuery({
    queryKey: ['admin', 'in-app-notifications', filters],
    queryFn: () => getInAppNotifications(filters),
    placeholderData: keepPreviousData,
    ...adminListQueryOptions,
  });
}

export function useInAppNotificationSummary() {
  return useQuery({
    queryKey: ['admin', 'in-app-notification-summary'],
    queryFn: () => getInAppNotificationSummary(),
    staleTime: ADMIN_LIVE_STALE_TIME,
    gcTime: ADMIN_GC_TIME,
    refetchOnMount: false,
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
