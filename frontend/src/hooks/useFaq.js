import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFaq, deleteFaq, getFaqById, getFaqs, reorderFaqs, updateFaq } from '@/lib/faqApi';

export function useFaqs(category) {
  return useQuery({
    queryKey: ['faqs', category || 'all'],
    queryFn: () => getFaqs(category),
  });
}

export function useFaqDetail(id, enabled = true) {
  return useQuery({
    queryKey: ['faqs', 'detail', id],
    queryFn: () => getFaqById(id),
    enabled: Boolean(id) && enabled,
  });
}

export function useCreateFaq() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: createFaq, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['faqs'] }) });
}

export function useUpdateFaq() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateFaq(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['faqs'] });
      queryClient.invalidateQueries({ queryKey: ['faqs', 'detail', variables.id] });
    },
  });
}

export function useDeleteFaq() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: deleteFaq, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['faqs'] }) });
}

export function useReorderFaqs() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: reorderFaqs, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['faqs'] }) });
}
