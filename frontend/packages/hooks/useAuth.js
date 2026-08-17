import { useMutation } from '@tanstack/react-query';
import { checkMobile, verifyOTP, registerUser } from '@tithi/lib/api';
import { useAuthStore } from '@tithi/store/authStore';

export function useCheckMobile() {
  return useMutation({
    mutationFn: (mobile) => checkMobile(mobile),
  });
}

export function useVerifyOTP() {
  const setUser = useAuthStore((state) => state.setUser);
  return useMutation({
    mutationFn: ({ mobile, otp }) => verifyOTP(mobile, otp),
    onSuccess: (data) => {
      if (data.success && data.user) {
        setUser(data.user, data.token);
      }
    },
  });
}

export function useRegisterUser() {
  const setUser = useAuthStore((state) => state.setUser);
  return useMutation({
    mutationFn: (userData) => registerUser(userData),
    onSuccess: (data) => {
      if (data.success && data.user) {
        setUser(data.user, data.token);
      }
    },
  });
}
