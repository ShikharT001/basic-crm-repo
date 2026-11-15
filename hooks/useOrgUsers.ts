import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";
import { CRMUserRole, OrgUser } from "@/types/crm";

export interface OrgUserFilterParams {
  page?: number;
  page_size?: number;
  search?: string;
  role_filter?: CRMUserRole | "";
}

export function useOrgUsers(params: OrgUserFilterParams = {}) {
  const queryClient = useQueryClient();
  const queryKey = ["crm", "org_users", params];

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const response = await api.get<OrgUser[]>("/organization/users", params as any);
      return {
        users: response.data,
        meta: response.meta,
      };
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async (payload: {
      full_name: string;
      email: string;
      password: string;
      phone?: string;
      role?: string;
    }) => {
      const response = await api.post<OrgUser>("/organization/users", payload);
      return response;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Team member account created");
      queryClient.invalidateQueries({ queryKey: ["crm", "org_users"] });
      queryClient.invalidateQueries({ queryKey: ["crm", "dashboard"] });
    },
    onError: (err: ApiError) => {
      toast.error(err.message || "Failed to create user account");
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<OrgUser> & { password?: string } }) => {
      const response = await api.put<OrgUser>(`/organization/users/${id}`, data);
      return response;
    },
    onSuccess: (res) => {
      toast.success(res.message || "User profile updated");
      queryClient.invalidateQueries({ queryKey: ["crm", "org_users"] });
    },
    onError: (err: ApiError) => {
      toast.error(err.message || "Failed to update user");
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete<{ user_id: string }>(`/organization/users/${id}`);
      return response;
    },
    onSuccess: (res) => {
      toast.success(res.message || "User deactivated");
      queryClient.invalidateQueries({ queryKey: ["crm", "org_users"] });
      queryClient.invalidateQueries({ queryKey: ["crm", "dashboard"] });
    },
    onError: (err: ApiError) => {
      toast.error(err.message || "Failed to deactivate user");
    },
  });

  return {
    users: query.data?.users || [],
    meta: query.data?.meta,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    createUser: createUserMutation.mutateAsync,
    isCreating: createUserMutation.isPending,
    updateUser: updateUserMutation.mutateAsync,
    isUpdating: updateUserMutation.isPending,
    deleteUser: deleteUserMutation.mutateAsync,
    isDeleting: deleteUserMutation.isPending,
  };
}
