import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../api";
import type { Activity, ActivityType } from "../../models/admin-activity";

type CreateActivityInput = {
    title: string;
    type: ActivityType;
    startsAt: string;
    endsAt: string;
    capacity: string;
    locationName: string;
    facilityId?: string;
};

export function useActivities() {
    return useQuery({
        queryKey: ["admin", "activities"],
        queryFn: () => apiRequest<Activity[]>("/api/activities"),
    });
}

export function useCreateActivity() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: CreateActivityInput) =>
            apiRequest<Activity>("/api/activities", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(input),
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["admin", "activities"],
            });
        },
    });
}

export function useDeleteActivity() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) =>
            apiRequest<void>(`/api/activities/${id}`, { method: "DELETE" }),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["admin", "activities"],
            });
        },
    });
}
