import { createAuthClient } from "better-auth/react"
import { languageClient } from "./custom-plugins/language/language-client";

const authClient = createAuthClient({
    plugins: [
        languageClient({ language: "de" })
    ]
})

export const { signIn, signUp, signOut, useSession, getSession, language } = authClient;
export { authClient };
