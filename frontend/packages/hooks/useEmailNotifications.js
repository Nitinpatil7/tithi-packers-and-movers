import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getEmailNotificationSettings, updateEmailNotificationSettings } from '@tithi/lib/emailNotificationApi';

const EMAIL_SETTINGS_QUERY_KEY = ['admin', 'email-notification-settings'];

export const useEmailNotificationSettings = () => useQuery({
  queryKey: EMAIL_SETTINGS_QUERY_KEY,
  queryFn: getEmailNotificationSettings,
  staleTime: 10 * 60 * 1000,
  gcTime: 30 * 60 * 1000,
  refetchOnMount: false,
  retry: 1,
});

export const useUpdateEmailNotificationSettings = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: updateEmailNotificationSettings,
    onSuccess: (settings) => {
      client.setQueryData(EMAIL_SETTINGS_QUERY_KEY, settings);
      client.invalidateQueries({ queryKey: EMAIL_SETTINGS_QUERY_KEY });
    },
  });
};
