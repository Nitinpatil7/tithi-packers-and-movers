import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSiteSetting, updateSiteSetting } from "@/lib/siteSettingApi";

export const useSiteSetting = () =>
  useQuery({
    queryKey: ["site-setting"],
    queryFn: getSiteSetting,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
export function useUpdateSiteSetting() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: updateSiteSetting,
    onSuccess: (data) => client.setQueryData(["site-setting"], data),
  });
}
