import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";
import { TRPCError } from "@trpc/server";

/**
 * Helper function to extract error message from various error types
 */
export function handleMutationError(error: unknown): string {
  if (error instanceof TRPCError) {
    return error.message;
  }
  
  if (error && typeof error === "object") {
    if ("message" in error && typeof error.message === "string") {
      return error.message;
    }
    if ("data" in error && error.data && typeof error.data === "object" && "message" in error.data) {
      return String(error.data.message);
    }
  }
  
  return "Ein unerwarteter Fehler ist aufgetreten";
}

/**
 * Hook that provides all organization-related mutations with consistent error handling
 * and automatic query invalidation
 */
export function useOrganizationActions() {
  const trpcOptions = useTRPC();
  const queryClient = useQueryClient();

  // Common success handler for organization mutations
  const handleOrgSuccess = async (message: string) => {
    toast.success(message);
    await queryClient.invalidateQueries(
      trpcOptions.organization.getMyOrganizations.queryFilter()
    );
  };

  // Common success handler for member mutations
  const handleMemberSuccess = async (message: string, organizationId: string) => {
    toast.success(message);
    await queryClient.invalidateQueries(
      trpcOptions.organization.listMembers.queryFilter({ organizationId })
    );
  };

  // Create organization mutation
  const createOrganization = useMutation(
    trpcOptions.organization.createOrganization.mutationOptions({
      onSuccess: async () => {
        await handleOrgSuccess("Organisation erstellt!");
      },
      onError: (error: unknown) => {
        toast.error(handleMutationError(error));
      },
    })
  );

  // Edit organization mutation
  const editOrganization = useMutation(
    trpcOptions.organization.editOrganization.mutationOptions({
      onSuccess: async () => {
        await handleOrgSuccess("Organisation bearbeitet!");
      },
      onError: (error: unknown) => {
        toast.error(handleMutationError(error));
      },
    })
  );

  // Delete organization mutation
  const deleteOrganization = useMutation(
    trpcOptions.organization.deleteOrganization.mutationOptions({
      onSuccess: async () => {
        await handleOrgSuccess("Organisation gelöscht!");
      },
      onError: (error: unknown) => {
        toast.error(handleMutationError(error));
      },
    })
  );

  // Add member mutation
  const addMember = useMutation(
    trpcOptions.organization.addMember.mutationOptions({
      onSuccess: async (_, variables) => {
        await handleMemberSuccess("Mitglied hinzugefügt!", variables.organizationId);
      },
      onError: (error: unknown) => {
        toast.error(handleMutationError(error));
      },
    })
  );

  // Update member role mutation
  const updateMemberRole = useMutation(
    trpcOptions.organization.updateMemberRole.mutationOptions({
      onSuccess: async (_, variables) => {
        await handleMemberSuccess("Rolle aktualisiert.", variables.organizationId);
      },
      onError: (error: unknown) => {
        toast.error(handleMutationError(error));
      },
    })
  );

  // Remove member mutation
  const removeMember = useMutation(
    trpcOptions.organization.removeMember.mutationOptions({
      onSuccess: async (_, variables) => {
        await handleMemberSuccess("Mitglied entfernt.", variables.organizationId);
      },
      onError: (error: unknown) => {
        toast.error(handleMutationError(error));
      },
    })
  );

  return {
    createOrganization,
    editOrganization,
    deleteOrganization,
    addMember,
    updateMemberRole,
    removeMember,
  };
}
