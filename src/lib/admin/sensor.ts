import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../api";
import type { SensorAssignment, SensorsResponse, SensorStatus } from "../../models/sensor";

export type UseSensorsOptions = {
    assignment?: SensorAssignment;
    status?: SensorStatus;
    page?: number;
    pageSize?: number;
};

export function useSensors(options: UseSensorsOptions = {}) {
    const { assignment, status, page, pageSize } = options;

    return useQuery({
        queryKey: ["admin", "sensors", { assignment, page, pageSize }],
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
