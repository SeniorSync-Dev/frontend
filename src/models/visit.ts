const visitStatusLabels = {
    planned: "Planlagt",
    in_progress: "I gang",
    completed: "Gennemført",
    cancelled: "Aflyst",
    missed: "Udeblevet",
} as const;

type VisitStatus = keyof typeof visitStatusLabels;

interface Visit {
    id: string;
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

export { visitStatusLabels };
export type { VisitStatus, Visit, VisitCitizen, VisitEmployee, VisitOptions };
