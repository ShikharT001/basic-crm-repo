import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { CRMDashboardData } from "@/types/crm";

export function useDashboard() {
  const query = useQuery({
    queryKey: ["crm", "dashboard"],
    queryFn: async () => {
      const response = await api.get<CRMDashboardData>("/dashboard/stats");
      return response.data;
    },
  });

  return {
    dashboard: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
