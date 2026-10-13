import { create } from 'zustand';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { AuthUser, LoginPayload } from '@/types/auth.types';
import { authService } from '@/services/auth.service';
import { TokenStorage } from '@/lib/token-storage';

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  setSession: (user: AuthUser) => void;
  clearSession: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isHydrated: false,

  setSession: (user: AuthUser) => {
    set({ user, isAuthenticated: true, isHydrated: true });
  },

  clearSession: () => {
    set({ user: null, isAuthenticated: false, isHydrated: true });
  },

  hydrate: () => {
    const tokenExists = TokenStorage.isLoggedIn();
    const storedUser = authService.getCurrentUser();

    if (tokenExists && storedUser) {
      set({ user: storedUser, isAuthenticated: true, isHydrated: true });
    } else {
      set({ user: null, isAuthenticated: false, isHydrated: true });
    }
  },
}));

/**
 * Hook Mutation đăng nhập
 */
export function useLogin() {
  const setSession = useAuthStore((state) => state.setSession);

  return useMutation({
    mutationFn: (payload: LoginPayload) => authService.login(payload),
    onSuccess: (data) => {
      setSession(data.user);
    },
  });
}

/**
 * Hook Mutation đăng xuất
 */
export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const clearSession = useAuthStore((state) => state.clearSession);

  return useMutation({
    mutationFn: () => authService.logout(),
    onSettled: () => {
      queryClient.clear();
      clearSession();
      router.replace('/login');
    },
  });
}
