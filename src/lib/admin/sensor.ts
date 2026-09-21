import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../api";
import type { Sensor } from "../../models/sensor";


export function useSensors() {
    return useQuery({
        queryKey: ["admin", "activities"],
        queryFn: () => apiRequest<Activity[]>("/api/activities"),
    });
}
