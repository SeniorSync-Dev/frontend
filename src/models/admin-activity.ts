const activityTypeLabels = {
    outing: "Udflugt",
    sports: "Sport",
    social: "Socialt",
    healthcare: "Sundhedspleje",
    training: "Træning",
    other: "Andet",
} as const;

type ActivityType = keyof typeof activityTypeLabels;

interface Activity {
    id: string;
    title: string;
    type: ActivityType;
    startsAt: string;
    endsAt: string;
    capacity: number | null;
    locationName: string | null;
}

export { activityTypeLabels };
export type { ActivityType, Activity };
