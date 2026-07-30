import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as api from '@/lib/itemApi';

export const useItemCatalog = (filters = {}) => useQuery({ queryKey: ['items', 'catalog', filters], queryFn: () => api.getItemCatalog(filters), staleTime: 5 * 60 * 1000, retry: 1 });
export const useAdminItemCatalog = (filters = {}) => useQuery({ queryKey: ['admin', 'items', 'catalog', filters], queryFn: () => api.getAdminItemCatalog(filters), placeholderData: keepPreviousData });
export const useAdminSections = (filters = {}) => useQuery({ queryKey: ['admin', 'items', 'sections', filters], queryFn: () => api.getAdminSections(filters), placeholderData: keepPreviousData });
export const useAdminSizes = (filters = {}) => useQuery({ queryKey: ['admin', 'items', 'sizes', filters], queryFn: () => api.getAdminSizes(filters), placeholderData: keepPreviousData });

function useItemMutation(mutationFn) {
  const client = useQueryClient();
  return useMutation({ mutationFn, onSuccess: () => { client.invalidateQueries({ queryKey: ['admin', 'items'] }); client.invalidateQueries({ queryKey: ['items', 'catalog'] }); } });
}

export const useCreateSection = () => useItemMutation(api.createSection);
export const useUpdateSection = () => useItemMutation(({ id, data }) => api.updateSection(id, data));
export const useDeleteSection = () => useItemMutation(api.deleteSection);
export const useCreateGroup = () => useItemMutation(api.createGroup);
export const useUpdateGroup = () => useItemMutation(({ id, data }) => api.updateGroup(id, data));
export const useDeleteGroup = () => useItemMutation(api.deleteGroup);
export const useReorderGroups = () => useItemMutation(api.reorderGroups);
export const useCreateSize = () => useItemMutation(api.createSize);
export const useUpdateSize = () => useItemMutation(({ id, data }) => api.updateSize(id, data));
export const useDeleteSize = () => useItemMutation(api.deleteSize);
export const useCreateItem = () => useItemMutation(api.createItem);
export const useUpdateItem = () => useItemMutation(({ id, data }) => api.updateItem(id, data));
export const useDeleteItem = () => useItemMutation(api.deleteItem);
export const useReorderItems = () => useItemMutation(api.reorderItems);
