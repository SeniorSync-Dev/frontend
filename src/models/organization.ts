const orgRoleLabels = {
    citizen: "Borger",
    relative: "Pårørende",
    employee: "Medarbejder",
    servicePartner: "Serviceudbyder",
    systemAdmin: "Systemadministrator",
} as const;

type OrgRole = keyof typeof orgRoleLabels;

interface Member {
    id: string;
    role: string;
    user: { name: string; email: string };
}

interface Invitation {
    id: string;
    email: string;
    role: string;
    status: string;
}

export { orgRoleLabels };
export type { OrgRole, Member, Invitation };
