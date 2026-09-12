import { createAuthClient } from "better-auth/react"
import {
    adminClient,
    inferAdditionalFields,
} from "better-auth/client/plugins";
import { ac, admin, relative, citizen, employee } from "./accessController";

export const authClient = createAuthClient({
    /** The base URL of the server (optional if you're using the same domain) */
    baseURL: "http://localhost:3000",

    plugins: [
        adminClient({
            ac,
            adminRole: admin,
            roles: {
                relative: relative,
                citizen: citizen,
                employee: employee,
                admin: admin,
            },
        }),

        inferAdditionalFields({
            user: {
                birthdate: {
                    type: "string",
                    required: false,
                },
                nin: {
                    type: "string",
                    required: false,
                },
                mitidUuid: {
                    type: "string",
                    required: false,
                },
            },
        }),
    ]
})