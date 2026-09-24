import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authClient } from "../auth-client";
import type { Invitation, Member, OrgRole } from "../../models/organization";

export function useMembers(organizationId: string | undefined) {
    return useQuery({
        queryKey: ["admin", "organization", organizationId, "members"],
        queryFn: async (): Promise<Member[]> => {
            const { data, error } = await authClient.organization.listMembers({
                query: { organizationId: organizationId! },
            });
            if (error)
                throw new Error(error.message ?? "Kunne ikke hente medlemmer.");
            return data?.members ?? [];
        },
        enabled: !!organizationId,
    });
}

export function useInvitations(organizationId: string | undefined) {
    return useQuery({
        queryKey: ["admin", "organization", organizationId, "invitations"],
        queryFn: async (): Promise<Invitation[]> => {
            const { data, error } =
                await authClient.organization.listInvitations({
                    query: { organizationId: organizationId! },
                });
            if (error)
                throw new Error(
                    error.message ?? "Kunne ikke hente invitationer.",
                );
            return data ?? [];
        },
        enabled: !!organizationId,
    });
}

export function useInviteMember(organizationId: string | undefined) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: {
            email: string;
            role: OrgRole;
            facilityId?: string;
            serviceProviderCompanyId?: string;
        }) => {
            const { error } = await authClient.organization.inviteMember({
                organizationId: organizationId!,
                email: input.email,
                role: input.role,
                ...(input.role === "citizen"
                    ? { facilityId: input.facilityId }
                    : {}),
                ...(input.role === "servicePartner"
                    ? {
                          serviceProviderCompanyId:
                              input.serviceProviderCompanyId,
                      }
                    : {}),
            });
            if (error)
                throw new Error(
                    error.message ?? "Kunne ikke oprette invitationen.",
                );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [
                    "admin",
                    "organization",
                    organizationId,
                    "invitations",
                ],
            });
        },
    });
}

export function useUpdateMemberRole(organizationId: string | undefined) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            memberId,
            role,
        }: {
            memberId: string;
            role: OrgRole;
        }) => {
            const { error } = await authClient.organization.updateMemberRole({
                organizationId: organizationId!,
                memberId,
                role,
            });
            if (error)
                throw new Error(error.message ?? "Kunne ikke opdatere rollen.");
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["admin", "organization", organizationId, "members"],
            });
        },
    });
}

export function useCancelInvitation(organizationId: string | undefined) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (invitationId: string) => {
            const { error } = await authClient.organization.cancelInvitation({
                invitationId,
            });
            if (error)
                throw new Error(
                    error.message ?? "Kunne ikke annullere invitationen.",
                );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [
                    "admin",
                    "organization",
                    organizationId,
                    "invitations",
                ],
            });
        },
    });
}
