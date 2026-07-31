import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { getSiteSetting, updateSiteSetting } from "@/lib/siteSettingApi";

export const useSiteSetting = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let idleId;
    let timer;
    const enable = () => setMounted(true);

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      idleId = window.requestIdleCallback(enable, { timeout: 500 });
    } else {
      timer = window.setTimeout(enable, 250);
    }

    return () => {
      if (idleId) window.cancelIdleCallback(idleId);
      if (timer) window.clearTimeout(timer);
    };
  }, []);

  return useQuery({
    queryKey: ["site-setting"],
    queryFn: getSiteSetting,
    enabled: mounted,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};
export function useUpdateSiteSetting() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: updateSiteSetting,
    onSuccess: (data) => client.setQueryData(["site-setting"], data),
  });
}
