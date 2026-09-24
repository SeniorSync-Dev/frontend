import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../api";
import type {
    ServiceProviderCategory,
    ServiceProviderCompany,
    ServiceProviderStaff,
} from "../../models/service-provider";

type CreateServiceProviderCompanyInput = {
    name: string;
    category: ServiceProviderCategory;
    phone: string;
    email: string;
};

export function useServiceProviderCompanies() {
    return useQuery({
        queryKey: ["admin", "service-providers"],
        queryFn: () =>
            apiRequest<ServiceProviderCompany[]>("/api/service-providers"),
    });
}

export function useMyServiceProviderCompany() {
    return useQuery({
        queryKey: ["admin", "service-providers", "me"],
        queryFn: () =>
            apiRequest<{ company: ServiceProviderCompany | null }>(
                "/api/service-providers/me",
            ),
    });
}

export function useCreateServiceProviderCompany() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: CreateServiceProviderCompanyInput) =>
            apiRequest<ServiceProviderCompany>("/api/service-providers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(input),
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["admin", "service-providers"],
            });
        },
    });
}

export function useServiceProviderStaff(enabled = true) {
    return useQuery({
        queryKey: ["admin", "service-providers", "staff"],
        queryFn: () =>
            apiRequest<ServiceProviderStaff[]>("/api/service-providers/staff"),
        enabled,
    });
}

export function useUpdateServiceProviderStaff() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            userId,
            companyId,
        }: {
            userId: string;
            companyId: string;
        }) =>
            apiRequest<ServiceProviderStaff>(
                `/api/service-providers/staff/${userId}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ companyId }),
                },
            ),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["admin", "service-providers", "staff"],
            });
        },
    });
}

export function useRemoveServiceProviderStaff() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (userId: string) =>
            apiRequest<void>(`/api/service-providers/staff/${userId}`, {
                method: "DELETE",
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["admin", "service-providers", "staff"],
            });
        },
    });
}
