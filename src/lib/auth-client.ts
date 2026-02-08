import { createAuthClient } from "better-auth/react"
import { twoFactorClient } from "better-auth/plugins"

const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  plugins: [twoFactorClient()],
})

export const { signIn, signUp, signOut, useSession, sendVerificationEmail, requestPasswordReset } = authClient;
export { authClient };
export type Session = typeof authClient.$Infer.Session