import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";
import { Contact } from "@/types/crm";

export interface ContactFilterParams {
  page?: number;
  page_size?: number;
  search?: string;
  company?: string;
}

export function useContacts(params: ContactFilterParams = {}) {
  const queryClient = useQueryClient();
  const queryKey = ["crm", "contacts", params];

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const response = await api.get<Contact[]>("/contacts", params as any);
      return {
        contacts: response.data,
        meta: response.meta,
      };
    },
  });

  const createContactMutation = useMutation({
    mutationFn: async (payload: Partial<Contact>) => {
      const response = await api.post<Contact>("/contacts", payload);
      return response;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Contact saved successfully");
      queryClient.invalidateQueries({ queryKey: ["crm", "contacts"] });
      queryClient.invalidateQueries({ queryKey: ["crm", "dashboard"] });
    },
    onError: (err: ApiError) => {
      toast.error(err.message || "Failed to create contact");
    },
  });

  const updateContactMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Contact> }) => {
      const response = await api.put<Contact>(`/contacts/${id}`, data);
      return response;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Contact updated successfully");
      queryClient.invalidateQueries({ queryKey: ["crm", "contacts"] });
    },
    onError: (err: ApiError) => {
      toast.error(err.message || "Failed to update contact");
    },
  });

  const deleteContactMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete<{ contact_id: string }>(`/contacts/${id}`);
      return response;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Contact deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["crm", "contacts"] });
    },
    onError: (err: ApiError) => {
      toast.error(err.message || "Failed to delete contact");
    },
  });

  return {
    contacts: query.data?.contacts || [],
    meta: query.data?.meta,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    createContact: createContactMutation.mutateAsync,
    isCreating: createContactMutation.isPending,
    updateContact: updateContactMutation.mutateAsync,
    isUpdating: updateContactMutation.isPending,
    deleteContact: deleteContactMutation.mutateAsync,
    isDeleting: deleteContactMutation.isPending,
  };
}
