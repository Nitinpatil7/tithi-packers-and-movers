import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createBooking, getMyBookings, getBookingById } from '@/lib/api';

export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bookingData) => createBooking(bookingData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

export function useMyBookings(mobile, token) {
  return useQuery({
    queryKey: ['bookings', 'my', mobile],
    queryFn: () => getMyBookings(mobile, token),
    enabled: !!mobile,
  });
}

export function useBookingDetail(id, token) {
  return useQuery({
    queryKey: ['bookings', 'detail', id],
    queryFn: () => getBookingById(id, token),
    enabled: !!id,
  });
}
