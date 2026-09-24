export interface SensorEvent {
    id: string;
    citizenUserId: string,
    citizenName: string,
    deviceId: string,
    deviceSerialNumber: string,
    deviceType: string,
    eventType: string,
    severity: string,
    status: string,
    occurredAt: Date,
    payload: any,
    acknowledgedAt: Date,
    acknowledgedByEmployeeId: string,
    acknowledgedByEmployeeName: string,
    resolvedAt: Date,
    resolvedByEmployeeId: string,
    resolvedByEmployeeName: string,
    resolutionNotes: string,
    createdAt: Date,
}

export type SensorEventSeverity = "info" | "warning" | "critical" | "emergency";
export type SensorEventStatus = "new" | "acknowledged" | "resolved" | "in_progress" | "false_alarm" | "dismissed";

export interface SensorEventPagination {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
}

export interface SensorEventsResponse {
    sensorEvents: SensorEvent[];
    pagination: SensorEventPagination;
}