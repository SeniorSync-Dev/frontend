const facilityTypeLabels = {
    nursing_home: "Plejehjem",
    health_center: "Sundhedscenter",
    activity_center: "Aktivitetscenter",
    rehab_center: "Genoptræningscenter",
    homecare_unit: "Hjemmepleje",
    other: "Andet",
} as const;

type FacilityType = keyof typeof facilityTypeLabels;

interface Facility {
    id: string;
    name: string;
    type: FacilityType;
}

export { facilityTypeLabels };
export type { FacilityType, Facility };
