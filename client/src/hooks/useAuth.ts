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
        try {
          return JSON.parse(savedUser);
        } catch (e) {
          localStorage.removeItem('user');
        }
      }
      
      // If not in localStorage and not using mock data, try API
      if (!USE_MOCK_DATA) {
        try {
          return await getQueryFn({ on401: "returnNull" })();
        } catch (e) {
          return null;
        }
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
