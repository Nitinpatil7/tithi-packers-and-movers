import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as api from '@lib/bookingPricingApi';

export const usePublicPricingRule = (serviceType) => useQuery({
  queryKey: ['booking-pricing-rule', serviceType],
  queryFn: () => api.getPublicPricingRule(serviceType),
  enabled: Boolean(serviceType),
  placeholderData: keepPreviousData,
  staleTime: 5 * 1000,
  refetchInterval: 15 * 1000,
  refetchOnWindowFocus: true,
});

export const usePublicPricingRules = (filters = {}) => useQuery({
  queryKey: ['booking-pricing-rules', 'public', filters],
  queryFn: () => api.getPublicPricingRules(filters),
  placeholderData: keepPreviousData,
  staleTime: 5 * 1000,
  refetchInterval: 15 * 1000,
  refetchOnWindowFocus: true,
});

export const useAdminPricingRules = (filters = {}) => useQuery({
  queryKey: ['admin', 'booking-pricing-rules', filters],
  queryFn: () => api.getAdminPricingRules(filters),
  placeholderData: keepPreviousData,
});

function usePricingMutation(mutationFn) {
  const client = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['admin', 'booking-pricing-rules'] });
      client.invalidateQueries({ queryKey: ['booking-pricing-rule'] });
      client.invalidateQueries({ queryKey: ['booking-pricing-rules', 'public'] });
    },
  });
}

export const useCreateDefaultPricingRules = () => usePricingMutation(api.createDefaultPricingRules);
export const useCreatePricingRule = () => usePricingMutation(api.createPricingRule);
export const useUpdatePricingRule = () => usePricingMutation(({ id, data }) => api.updatePricingRule(id, data));
export const useDeletePricingRule = () => usePricingMutation(api.deletePricingRule);
