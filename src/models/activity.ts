interface Activity {
    id: string;
    title: string;
    start: Date;
    end?: Date;
    location?: string;
    meetingPoint?: string;
    providerCompanyName?: string;
    availableSpots?: number;
    isSignedUp: boolean;
}

export type { Activity };
