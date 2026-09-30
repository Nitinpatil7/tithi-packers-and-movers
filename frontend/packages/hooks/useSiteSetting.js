import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSiteSetting, updateSiteSetting, uploadSiteLogo } from "@tithi/lib/siteSettingApi";

export const useSiteSetting = () =>
  useQuery({
    queryKey: ["site-setting"],
    queryFn: getSiteSetting,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: 1,
  });
export function useUpdateSiteSetting() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: updateSiteSetting,
    onSuccess: (data) => client.setQueryData(["site-setting"], data),
  });
}

export function useUploadSiteLogo() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: uploadSiteLogo,
    onSuccess: (data) => client.setQueryData(["site-setting"], data),
  });
}
