export interface Sensor {
    id: string,
    serialNumber: string,
    type: string,
    model: string,
    manufacturer: string,
    mqttTopic: string,
    status: string,
    batteryLevel: number,
    lastSeenAt: Date,
    locationDescription: string,
    citizenUserId: string,
    citizenName: string,
    createdAt: Date,
    updatedAt: Date,
}

export type SensorAssignment = "assigned" | "unassigned";
export type SensorStatus = "active" | "offline";

export interface SensorPagination {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
}

export interface SensorsResponse {
    sensors: Sensor[];
    pagination: SensorPagination;
}
