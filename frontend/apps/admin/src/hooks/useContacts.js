import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { deleteContact, getContactById, getContacts, updateContact } from '@lib/contactApi';

export const useContacts = (status = 'all') => useQuery({ queryKey: ['admin', 'contacts', status], queryFn: () => getContacts(status), placeholderData: keepPreviousData });
export const useContactDetail = (id) => useQuery({ queryKey: ['admin', 'contacts', 'detail', id], queryFn: () => getContactById(id), enabled: Boolean(id) });

export function useUpdateContact() {
  const client = useQueryClient();
  return useMutation({ mutationFn: ({ id, data }) => updateContact(id, data), onSuccess: () => client.invalidateQueries({ queryKey: ['admin', 'contacts'] }) });
}

export function useDeleteContact() {
  const client = useQueryClient();
  return useMutation({ mutationFn: deleteContact, onSuccess: () => client.invalidateQueries({ queryKey: ['admin', 'contacts'] }) });
}
