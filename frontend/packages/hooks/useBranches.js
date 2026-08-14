import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createBranch, deleteBranch, getBranches, getMainBranch, updateBranch } from '@lib/branchApi';

export const useBranches = () => useQuery({ queryKey: ['branches'], queryFn: getBranches, staleTime: 5 * 60 * 1000, retry: 1 });
export const useMainBranch = () => useQuery({ queryKey: ['branches', 'main'], queryFn: getMainBranch, staleTime: 5 * 60 * 1000, retry: 1 });
export function useCreateBranch() {
  const client = useQueryClient();
  return useMutation({ mutationFn: createBranch, onSuccess: (created) => { client.setQueryData(['branches'], (current = []) => [created, ...current.filter((item) => item._id !== created._id)]); client.invalidateQueries({ queryKey: ['branches', 'main'] }); } });
}
export function useUpdateBranch() {
  const client = useQueryClient();
  return useMutation({ mutationFn: ({ id, data }) => updateBranch(id, data), onSuccess: (updated) => { client.setQueryData(['branches'], (current = []) => current.map((item) => item._id === updated._id ? updated : item)); client.invalidateQueries({ queryKey: ['branches', 'main'] }); } });
}
export function useDeleteBranch() {
  const client = useQueryClient();
  return useMutation({ mutationFn: deleteBranch, onSuccess: (updated) => { client.setQueryData(['branches'], (current = []) => current.filter((item) => item._id !== updated._id)); client.invalidateQueries({ queryKey: ['branches', 'main'] }); } });
}
