import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSiteSetting, updateSiteSetting, uploadSiteLogo } from "@tithi/lib/siteSettingApi";

export const useSiteSetting = () =>
  useQuery({
    queryKey: ["site-setting"],
    queryFn: getSiteSetting,
    staleTime: 0,
    refetchOnMount: "always",
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
