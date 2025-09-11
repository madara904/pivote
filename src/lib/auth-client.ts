import { createAuthClient } from "better-auth/react"

const authClient = createAuthClient({})

export const { signIn, signUp, signOut, useSession, getSession } = authClient;
export { authClient };
export type Session = typeof authClient.$Infer.Session