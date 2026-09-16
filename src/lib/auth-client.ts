import { createAuthClient } from "better-auth/react";
import {
    inferAdditionalFields,
    organizationClient,
} from "better-auth/client/plugins";
import {
    ac,
    citizen,
    employee,
    relative,
    systemAdmin,
} from "./accessController";
import { API_BASE_URL } from "./api";

export { API_BASE_URL };

export const authClient = createAuthClient({
    baseURL: API_BASE_URL,

    plugins: [
        organizationClient({
            ac,
            roles: {
                citizen,
                relative,
                employee,
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