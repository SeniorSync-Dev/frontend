const visitStatusLabels = {
    planned: "Planlagt",
    in_progress: "I gang",
    completed: "Gennemført",
    cancelled: "Aflyst",
    missed: "Udeblevet",
} as const;

type VisitStatus = keyof typeof visitStatusLabels;

const visitTypeLabels = {
    visit: "Fysisk besøg",
    call: "Skærmbesøg",
} as const;

type VisitType = keyof typeof visitTypeLabels;

interface Visit {
    id: string;
    type: VisitType;
    title: string;
    description: string | null;
    scheduledStart: string;
    scheduledEnd: string | null;
    status: VisitStatus;
    citizenUserId: string;
    citizenName: string;
    assignedEmployeeId: string | null;
    employeeName: string | null;
}

interface VisitCitizen {
    userId: string;
    name: string;
}

interface VisitEmployee {
    id: string;
    name: string;
}

interface VisitOptions {
    citizens: VisitCitizen[];
    employees: VisitEmployee[];
}

export { visitStatusLabels, visitTypeLabels };
export type { VisitStatus, VisitType, Visit, VisitCitizen, VisitEmployee, VisitOptions };
