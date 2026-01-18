import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import type { UserWithDriver } from "@/lib/types";
import { USE_MOCK_DATA } from "@/lib/config";

export function useAuth() {
  const { data: user, isLoading } = useQuery<UserWithDriver>({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      // Always check localStorage first
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        return JSON.parse(savedUser);
      }
      
      // If not in localStorage and not using mock data, try API
      if (!USE_MOCK_DATA) {
        return getQueryFn({ on401: "returnNull" })();
      }
      
      return null;
    },
    retry: false,
    staleTime: Infinity,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}
