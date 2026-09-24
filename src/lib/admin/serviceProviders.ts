import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../api";
import type {
    ServiceProviderCategory,
    ServiceProviderCompany,
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

export function useMyServiceProviderCompanyId() {
    return useQuery({
        queryKey: ["admin", "service-providers", "me"],
        queryFn: () =>
            apiRequest<{ companyId: string | null }>(
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
