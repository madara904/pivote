import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { localization } from "better-auth-localization";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { env } from "./env/env";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  trustedOrigins: ["https://pivote.vercel.app", "https://pivote.de"],  
  user: {
    deleteUser: { enabled: true },
    changeEmail: {enabled: true}
  },
  emailAndPassword: {
    enabled: true,
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
      fallbackLocale: "default",
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
        },
        "fr": {
          USER_NOT_FOUND: "Utilisateur non trouvé",
          FAILED_TO_CREATE_USER: "Échec de la création de l'utilisateur",
          FAILED_TO_CREATE_SESSION: "Échec de la création de la session",
          FAILED_TO_UPDATE_USER: "Échec de la mise à jour de l'utilisateur",
          FAILED_TO_GET_SESSION: "Échec de la récupération de la session",
          INVALID_PASSWORD: "Mot de passe invalide",
          INVALID_EMAIL: "Veuillez saisir une adresse e-mail valide",
          INVALID_EMAIL_OR_PASSWORD: "Adresse e-mail ou mot de passe invalide",
          SOCIAL_ACCOUNT_ALREADY_LINKED: "Ce compte de réseau social est déjà lié",
          PROVIDER_NOT_FOUND: "Fournisseur non trouvé",
          INVALID_TOKEN: "Jeton invalide",
          ID_TOKEN_NOT_SUPPORTED: "Jeton d'identité non pris en charge",
          FAILED_TO_GET_USER_INFO: "Échec de la récupération des informations utilisateur",
          USER_EMAIL_NOT_FOUND: "Adresse e-mail non trouvée",
          EMAIL_NOT_VERIFIED: "Adresse e-mail non vérifiée",
          PASSWORD_TOO_SHORT: "Le mot de passe est trop court",
          PASSWORD_TOO_LONG: "Le mot de passe est trop long",
          USER_ALREADY_EXISTS: "Cette adresse e-mail est déjà utilisée",
          EMAIL_CAN_NOT_BE_UPDATED: "L'adresse e-mail ne peut pas être mise à jour",
          CREDENTIAL_ACCOUNT_NOT_FOUND: "Identifiants non trouvés",
          SESSION_EXPIRED: "Votre session a expiré. Veuillez vous reconnecter",
          FAILED_TO_UNLINK_LAST_ACCOUNT: "Le dernier compte lié ne peut pas être délié",
          ACCOUNT_NOT_FOUND: "Compte non trouvé"
        }
      }
    })
  ]
});
