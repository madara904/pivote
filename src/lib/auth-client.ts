import { createAuthClient } from "better-auth/react"
import { organizationClient } from "better-auth/client/plugins"
import { languageClient } from "./custom-plugins/language/language-client";

const authClient = createAuthClient({
    baseURL: "http://localhost:3000",
    plugins: [
        organizationClient(),
        languageClient({ language: "de" })
    ]
})

export const { signIn, signUp, signOut, useSession, getSession, useActiveOrganization, organization, language } = authClient;
