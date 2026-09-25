import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../api";
import type { Visit, VisitOptions, VisitType } from "../../models/visit";

type CreateVisitInput = {
    citizenUserId: string;
    type: VisitType;
    assignedEmployeeId?: string;
    title?: string;
    scheduledStart: string;
    scheduledEnd?: string;
};

export function useVisits() {
    return useQuery({
        queryKey: ["admin", "visits"],
        queryFn: () => apiRequest<Visit[]>("/api/visits"),
    });
}

export function useVisitOptions() {
    return useQuery({
        queryKey: ["admin", "visits", "options"],
        queryFn: () => apiRequest<VisitOptions>("/api/visits/options"),
    });
}

export function useCreateVisit() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: CreateVisitInput) =>
            apiRequest<Visit>("/api/visits", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(input),
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin", "visits"] });
        },
    });
}

export function useAssignVisit() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (visitId: string) =>
            apiRequest<Visit>(`/api/visits/${visitId}/assign`, {
                method: "POST",
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin", "visits"] });
        },
    });
}
