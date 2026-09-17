import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../api";
import type { Facility, FacilityType } from "../../models/facility";

type CreateFacilityInput = {
    name: string;
    type: FacilityType;
    street: string;
    zipCode: string;
    city: string;
};

export function useFacilities() {
    return useQuery({
        queryKey: ["admin", "facilities"],
        queryFn: () => apiRequest<Facility[]>("/api/facilities"),
    });
}

export function useCreateFacility() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: CreateFacilityInput) =>
            apiRequest<Facility>("/api/facilities", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(input),
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["admin", "facilities"],
            });
        },
    });
}
