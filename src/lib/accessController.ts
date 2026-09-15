import { createAccessControl } from "better-auth/plugins/access";

export const statement = {
    project: ["create", "share", "update", "delete"],
    organization: ["create", "share", "update", "delete"],
} as const;

export const ac = createAccessControl(statement);

export const citizen = ac.newRole({
    project: ["create"],
});
export const relative = ac.newRole({
    project: ["create"],
});
export const employee = ac.newRole({
    project: ["create"],
});

export const systemAdmin = ac.newRole({
    project: ["create", "update", "delete", "share"],
    organization: ["create", "update", "delete", "share"],
});
