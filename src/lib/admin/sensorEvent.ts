import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { apiRequest } from "../api";
import type { SensorEvent, SensorEventsResponse, SensorEventStatus, SensorEventSeverity } from "../../models/sensorEvent";

export type UseSensorEventsOptions = {
    severity?: SensorEventSeverity;
    status?: SensorEventStatus;
    page?: number;
    pageSize?: number;
    refetchInterval?: number;
};

export function sensorEventsQueryOptions(options: UseSensorEventsOptions = {}) {
    const { severity, status, page, pageSize, refetchInterval } = options;

    return {
        queryKey: ["admin", "sensor-events", { status, severity, page, pageSize }],
        refetchInterval,
        queryFn: () => {
            const searchParams = new URLSearchParams();

            if (severity) searchParams.set("severity", severity);
            if (status) searchParams.set("status", status);
            if (page !== undefined) searchParams.set("page", String(page));
            if (pageSize !== undefined) searchParams.set("pageSize", String(pageSize));

            const query = searchParams.toString();
            return apiRequest<SensorEventsResponse>(`/sensor-events${query ? `?${query}` : ""}`);
        },
    };
}

export function useSensorEvents(options: UseSensorEventsOptions = {}) {
    return useQuery(sensorEventsQueryOptions(options));
}

export function useAcknowledgeSensorEvent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: { sensorEventId: string}) =>
            apiRequest<SensorEvent>(`/sensor-events/${input.sensorEventId}/acknowledge`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["admin", "sensor-events"],
            });
        },
    });
}

export function useResolveSensorEvent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: { sensorEventId: string, resolutionNotes: string }) =>
            apiRequest<SensorEvent>(`/sensor-events/${input.sensorEventId}/resolve`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ resolutionNotes: input.resolutionNotes }),
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["admin", "sensor-events"],
            });
        },
    });
}
