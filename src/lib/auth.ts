import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { localization } from "better-auth-localization";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { env } from "./env/env";
import { sendEmail } from "./send-email";

export const auth = betterAuth({
  emailVerification: {
    enabled: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
          to: user.email,
          subject: 'Bestätigen Sie Ihre E-Mail-Adresse',
          text: `Klicken Sie auf den Link, um Ihre E-Mail-Adresse zu bestätigen: ${url}`
      })
  }
},
appName: "Pivote",
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  trustedOrigins: ["https://pivote.vercel.app", "https://pivote.de"],  
  user: {
    deleteUser: { enabled: true },
    changeEmail: {enabled: true},
    additionalFields: {
      orgType: {
        type: "string",
        required: false,
      }
    }
  },
  emailAndPassword: {
    autoSignIn: true, 
    autoSignInAfterVerification: true,
    autoSignInAfterResetPassword: true,
    enabled: true,
    sendResetPassword: async ({user, token}) => {
      const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset?token=${token}`;
      await sendEmail({
        to: user.email,
        subject: "Passwort zurücksetzen",
        text: `Klicken Sie auf den Link, um Ihr Passwort zurückzusetzen: ${resetUrl}`,
      });
    }
  },
  account: {
    accountLinking: {
      enabled: true,
    },
  },
  socialProviders: {
    github: {
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
    },
  },
  session: {
      cookieCache: {
        enabled: true,
        maxAge: 5 * 60, 
      },
    },
  hooks: {
    },
  plugins: [
    localization({
      defaultLocale: "de",
      fallbackLocale: "de",
      translations: {
        "de": {
          USER_NOT_FOUND: "Benutzer nicht gefunden",
          FAILED_TO_CREATE_USER: "Benutzer konnte nicht erstellt werden",
          FAILED_TO_CREATE_SESSION: "Sitzung konnte nicht erstellt werden",
          FAILED_TO_UPDATE_USER: "Benutzer konnte nicht aktualisiert werden",
          FAILED_TO_GET_SESSION: "Sitzung konnte nicht abgerufen werden",
          INVALID_PASSWORD: "Ungültiges Passwort",
          INVALID_EMAIL: "Bitte geben Sie eine gültige E-Mail-Adresse ein",
          INVALID_EMAIL_OR_PASSWORD: "Ungültige E-Mail-Adresse oder Passwort",
          SOCIAL_ACCOUNT_ALREADY_LINKED: "Dieses Social Media Konto ist bereits verknüpft",
          PROVIDER_NOT_FOUND: "Anbieter nicht gefunden",
          INVALID_TOKEN: "Ungültiges Token",
          ID_TOKEN_NOT_SUPPORTED: "ID-Token wird nicht unterstützt",
          FAILED_TO_GET_USER_INFO: "Benutzerinformationen konnten nicht abgerufen werden",
          USER_EMAIL_NOT_FOUND: "E-Mail-Adresse nicht gefunden",
          EMAIL_NOT_VERIFIED: "E-Mail-Adresse nicht verifiziert",
          PASSWORD_TOO_SHORT: "Das Passwort ist zu kurz",
          PASSWORD_TOO_LONG: "Das Passwort ist zu lang",
          USER_ALREADY_EXISTS: "Diese E-Mail-Adresse wird bereits verwendet",
          EMAIL_CAN_NOT_BE_UPDATED: "E-Mail-Adresse kann nicht aktualisiert werden",
          CREDENTIAL_ACCOUNT_NOT_FOUND: "Anmeldedaten nicht gefunden",
          SESSION_EXPIRED: "Ihre Sitzung ist abgelaufen. Bitte melden Sie sich erneut an",
          FAILED_TO_UNLINK_LAST_ACCOUNT: "Das letzte verknüpfte Konto kann nicht getrennt werden",
          ACCOUNT_NOT_FOUND: "Konto nicht gefunden",
          ORGANIZATION_ALREADY_EXISTS: "Diese Organisation existiert bereits."
        },
        "en": {
          USER_NOT_FOUND: "User not found",
          FAILED_TO_CREATE_USER: "Failed to create user",
          FAILED_TO_CREATE_SESSION: "Failed to create session",
          FAILED_TO_UPDATE_USER: "Failed to update user",
          FAILED_TO_GET_SESSION: "Failed to get session",
          INVALID_PASSWORD: "Invalid password",
          INVALID_EMAIL: "Please enter a valid email address",
          INVALID_EMAIL_OR_PASSWORD: "Invalid email address or password",
          SOCIAL_ACCOUNT_ALREADY_LINKED: "This social media account is already linked",
          PROVIDER_NOT_FOUND: "Provider not found",
          INVALID_TOKEN: "Invalid token",
          ID_TOKEN_NOT_SUPPORTED: "ID token not supported",
          FAILED_TO_GET_USER_INFO: "Failed to get user information",
          USER_EMAIL_NOT_FOUND: "Email address not found",
          EMAIL_NOT_VERIFIED: "Email address not verified",
          PASSWORD_TOO_SHORT: "Password is too short",
          PASSWORD_TOO_LONG: "Password is too long",
          USER_ALREADY_EXISTS: "This email address is already in use",
          EMAIL_CAN_NOT_BE_UPDATED: "Email address cannot be updated",
          CREDENTIAL_ACCOUNT_NOT_FOUND: "Credentials not found",
          SESSION_EXPIRED: "Your session has expired. Please sign in again",
          FAILED_TO_UNLINK_LAST_ACCOUNT: "The last linked account cannot be unlinked",
          ACCOUNT_NOT_FOUND: "Account not found",
          ORGANIZATION_ALREADY_EXISTS: "This organization already exists"
        }
      }
    })
  ]
});

export type Session = typeof auth.$Infer.Session