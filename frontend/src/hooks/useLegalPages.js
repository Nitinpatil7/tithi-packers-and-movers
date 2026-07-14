import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createLegalPage, getLegalPages, getPublishedLegalPage, unpublishLegalPage, updateLegalPage } from '@/lib/legalApi';

export function useLegalPages(filters = {}) {
  return useQuery({ queryKey: ['admin', 'legal', filters], queryFn: () => getLegalPages(filters), placeholderData: keepPreviousData, refetchOnMount: false });
}

export function usePublishedLegalPage(slug) {
  return useQuery({ queryKey: ['legal', slug], queryFn: () => getPublishedLegalPage(slug), enabled: Boolean(slug), retry: 1 });
}

function useLegalMutation(mutationFn) {
  const client = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['admin', 'legal'] });
      client.invalidateQueries({ queryKey: ['legal'] });
    },
  });
}

export const useCreateLegalPage = () => useLegalMutation(createLegalPage);
export const useUpdateLegalPage = () => useLegalMutation(({ id, data }) => updateLegalPage(id, data));
export const useUnpublishLegalPage = () => useLegalMutation(unpublishLegalPage);
