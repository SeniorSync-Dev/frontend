import { createAuthClient } from "better-auth/react";
import {
    organizationClient,
    inferAdditionalFields,
} from "better-auth/client/plugins";
import {
    ac,
    citizen,
    relative,
    employee,
    servicePartner,
    systemAdmin,
} from "./accessController";

export const API_BASE_URL = "http://localhost:3000";

export const authClient = createAuthClient({
    /** The base URL of the server (optional if you're using the same domain) */
    baseURL: API_BASE_URL,

    plugins: [
        organizationClient({
            ac,
            roles: {
                citizen,
                relative,
                employee,
                servicePartner,
                systemAdmin,
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
    ],
});
