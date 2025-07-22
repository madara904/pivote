import { createAuthClient } from "better-auth/react"
import { languageClient } from "./custom-plugins/language/language-client";

const authClient = createAuthClient({
    baseURL: "http://localhost:3000",
    plugins: [
        languageClient({ language: "de" })
    ]
})

export const { signIn, signUp, signOut, useSession, getSession, language } = authClient;
export { authClient };
