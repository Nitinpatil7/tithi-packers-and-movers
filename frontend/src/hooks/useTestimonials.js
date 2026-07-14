import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createTestimonial, deleteTestimonial, getAdminTestimonials, getPublicTestimonials, updateTestimonial } from '@/lib/testimonialApi';

export const usePublicTestimonials = (filters = {}) => useQuery({ queryKey: ['testimonials', 'public', filters], queryFn: () => getPublicTestimonials(filters), staleTime: 5 * 60 * 1000, retry: 1 });
export const useAdminTestimonials = (filters = {}) => useQuery({ queryKey: ['admin', 'testimonials', filters], queryFn: () => getAdminTestimonials(filters), placeholderData: keepPreviousData, refetchOnMount: false });

function useTestimonialMutation(mutationFn) {
  const client = useQueryClient();
  return useMutation({ mutationFn, onSuccess: () => { client.invalidateQueries({ queryKey: ['admin', 'testimonials'] }); client.invalidateQueries({ queryKey: ['testimonials', 'public'] }); } });
}

export const useCreateTestimonial = () => useTestimonialMutation(createTestimonial);
export const useUpdateTestimonial = () => useTestimonialMutation(({ id, data }) => updateTestimonial(id, data));
export const useDeleteTestimonial = () => useTestimonialMutation(deleteTestimonial);

