import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '@/lib/bookingDraftApi';

export const useCreateBookingDraft = () => useMutation({ mutationFn: api.createBookingDraft });
export const useUpdateBookingDraft = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ bookingId, draftToken, data }) => api.updateBookingDraft(bookingId, draftToken, data),
    onSuccess: () => client.invalidateQueries({ queryKey: ['bookings'] }),
  });
};
export const useConfirmBookingDraft = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ bookingId, draftToken, data }) => api.confirmBookingDraft(bookingId, draftToken, data),
    onSuccess: () => client.invalidateQueries({ queryKey: ['bookings'] }),
  });
};

