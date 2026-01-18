import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import type { UserWithDriver } from "@/lib/types";
import { USE_MOCK_DATA } from "@/lib/config";

export function useAuth() {
  const { data: user, isLoading } = useQuery<UserWithDriver>({
    queryKey: ["/api/auth/me"],
    queryFn: USE_MOCK_DATA ? async () => {
      // Check localStorage for saved user
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        return JSON.parse(savedUser);
      }
      return null;
    } : getQueryFn({ on401: "returnNull" }),
    retry: false,
    staleTime: Infinity, // Keep user data indefinitely
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}
