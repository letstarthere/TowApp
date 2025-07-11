import { useQuery } from "@tanstack/react-query";
import type { UserWithDriver } from "@/lib/types";

export function useAuth() {
  const { data: user, isLoading } = useQuery<UserWithDriver>({
    queryKey: ["/api/auth/me"],
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}
