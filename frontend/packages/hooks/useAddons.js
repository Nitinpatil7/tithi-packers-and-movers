import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as api from '@lib/addonApi';

export const useAvailableAddons = (filters) => useQuery({ queryKey: ['addons', 'available', filters], queryFn: () => api.getAvailableAddons(filters), enabled: Boolean(filters?.serviceType), placeholderData: keepPreviousData, staleTime: 2 * 60 * 1000 });
export const useAdminAddons = (filters = {}) => useQuery({ queryKey: ['admin', 'addons', filters], queryFn: () => api.getAdminAddons(filters), placeholderData: keepPreviousData });
export const useTriggerGroups = (filters = {}) => useQuery({ queryKey: ['admin', 'addons', 'trigger-groups', filters], queryFn: () => api.getTriggerGroups(filters), placeholderData: keepPreviousData });
export const useTriggerItems = (filters = {}) => useQuery({ queryKey: ['admin', 'addons', 'trigger-items', filters], queryFn: () => api.getTriggerItems(filters), placeholderData: keepPreviousData });

function useAddonMutation(mutationFn) {
  const client = useQueryClient();
  return useMutation({ mutationFn, onSuccess: () => { client.invalidateQueries({ queryKey: ['admin', 'addons'] }); client.invalidateQueries({ queryKey: ['addons', 'available'] }); } });
}
export const useCreateAddon = () => useAddonMutation(api.createAddon);
export const useUpdateAddon = () => useAddonMutation(({ id, data }) => api.updateAddon(id, data));
export const useDeleteAddon = () => useAddonMutation(api.deleteAddon);
export const useReorderAddons = () => useAddonMutation(api.reorderAddons);
