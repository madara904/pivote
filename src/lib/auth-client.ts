import { createAuthClient } from "better-auth/react"
import { languageClient } from "./custom-plugins/language/language-client";

const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
    plugins: [
        languageClient({ language: "de" })
    ]
})

export const { signIn, signUp, signOut, useSession, getSession, language } = authClient;
export { authClient };
