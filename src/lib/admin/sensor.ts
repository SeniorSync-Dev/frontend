import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { apiRequest } from "../api";
import type { SensorAssignment, SensorsResponse, SensorStatus, Sensor } from "../../models/sensor";

export type UseSensorsOptions = {
    assignment?: SensorAssignment;
    status?: SensorStatus;
    page?: number;
    pageSize?: number;
    refetchInterval?: number;
};

export function useSensors(options: UseSensorsOptions = {}) {
    const { assignment, status, page, pageSize, refetchInterval } = options;

    return useQuery({
        queryKey: ["admin", "sensors", { assignment, status, page, pageSize }],
        refetchInterval,
        queryFn: () => {
            const searchParams = new URLSearchParams();

            if (assignment) searchParams.set("assignment", assignment);
            if (status) searchParams.set("status", status);
            if (page !== undefined) searchParams.set("page", String(page));
            if (pageSize !== undefined) searchParams.set("pageSize", String(pageSize));

            const query = searchParams.toString();
            return apiRequest<SensorsResponse>(`/sensors${query ? `?${query}` : ""}`);
        },
    });
}

export function useAssignSensor() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: { sensorId: string; citizenUserId: string }) =>
            apiRequest<Sensor>(`/sensors/${input.sensorId}/assignment`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(input),
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["admin", "sensors"],
            });
        },
    });
}

export function useUnassignSensor() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: { sensorId: string }) =>
            apiRequest<Sensor>(`/sensors/${input.sensorId}/unassignment`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["admin", "sensors"],
            });
        },
    });
}
