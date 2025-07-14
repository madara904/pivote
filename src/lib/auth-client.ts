import { createAuthClient } from "better-auth/react"
import { organizationClient } from "better-auth/client/plugins"

const authClient = createAuthClient({
    baseURL: "http://localhost:3000",
    plugins: [
        organizationClient()
    ]
})

type ErrorCode = 
    | "USER_NOT_FOUND"
    | "FAILED_TO_CREATE_USER"
    | "FAILED_TO_CREATE_SESSION"
    | "FAILED_TO_UPDATE_USER"
    | "FAILED_TO_GET_SESSION"
    | "INVALID_PASSWORD"
    | "INVALID_EMAIL"
    | "INVALID_EMAIL_OR_PASSWORD"
    | "SOCIAL_ACCOUNT_ALREADY_LINKED"
    | "PROVIDER_NOT_FOUND"
    | "INVALID_TOKEN"
    | "ID_TOKEN_NOT_SUPPORTED"
    | "FAILED_TO_GET_USER_INFO"
    | "USER_EMAIL_NOT_FOUND"
    | "EMAIL_NOT_VERIFIED"
    | "PASSWORD_TOO_SHORT"
    | "PASSWORD_TOO_LONG"
    | "USER_ALREADY_EXISTS"
    | "EMAIL_CAN_NOT_BE_UPDATED"
    | "CREDENTIAL_ACCOUNT_NOT_FOUND"
    | "SESSION_EXPIRED"
    | "FAILED_TO_UNLINK_LAST_ACCOUNT"
    | "ACCOUNT_NOT_FOUND";

const errorCodes: Record<ErrorCode, { de: string }> = {
    USER_NOT_FOUND: {
        de: "Benutzer nicht gefunden",
    },
    FAILED_TO_CREATE_USER: {
        de: "Benutzer konnte nicht erstellt werden",
    },
    FAILED_TO_CREATE_SESSION: {
        de: "Sitzung konnte nicht erstellt werden",
    },
    FAILED_TO_UPDATE_USER: {
        de: "Benutzer konnte nicht aktualisiert werden",
    },
    FAILED_TO_GET_SESSION: {
        de: "Sitzung konnte nicht abgerufen werden",
    },
    INVALID_PASSWORD: {
        de: "Ungültiges Passwort",
    },
    INVALID_EMAIL: {
        de: "Bitte geben Sie eine gültige E-Mail-Adresse ein",
    },
    INVALID_EMAIL_OR_PASSWORD: {
        de: "Ungültige E-Mail-Adresse oder Passwort",
    },
    SOCIAL_ACCOUNT_ALREADY_LINKED: {
        de: "Dieses Social Media Konto ist bereits verknüpft",
    },
    PROVIDER_NOT_FOUND: {
        de: "Anbieter nicht gefunden",
    },
    INVALID_TOKEN: {
        de: "Ungültiges Token",
    },
    ID_TOKEN_NOT_SUPPORTED: {
        de: "ID-Token wird nicht unterstützt",
    },
    FAILED_TO_GET_USER_INFO: {
        de: "Benutzerinformationen konnten nicht abgerufen werden",
    },
    USER_EMAIL_NOT_FOUND: {
        de: "E-Mail-Adresse nicht gefunden",
    },
    EMAIL_NOT_VERIFIED: {
        de: "E-Mail-Adresse nicht verifiziert",
    },
    PASSWORD_TOO_SHORT: {
        de: "Das Passwort ist zu kurz",
    },
    PASSWORD_TOO_LONG: {
        de: "Das Passwort ist zu lang",
    },
    USER_ALREADY_EXISTS: {
        de: "Diese E-Mail-Adresse wird bereits verwendet",
    },
    EMAIL_CAN_NOT_BE_UPDATED: {
        de: "E-Mail-Adresse kann nicht aktualisiert werden",
    },
    CREDENTIAL_ACCOUNT_NOT_FOUND: {
        de: "Anmeldedaten nicht gefunden",
    },
    SESSION_EXPIRED: {
        de: "Ihre Sitzung ist abgelaufen. Bitte melden Sie sich erneut an",
    },
    FAILED_TO_UNLINK_LAST_ACCOUNT: {
        de: "Das letzte verknüpfte Konto kann nicht getrennt werden",
    },
    ACCOUNT_NOT_FOUND: {
        de: "Konto nicht gefunden",
    }
};

const getErrorMessage = (code: string) => {
    if (code in errorCodes) {
        return errorCodes[code as ErrorCode].de;
    }
    return "Ein unbekannter Fehler ist aufgetreten";
};

export const { signIn, signUp, signOut, useSession, getSession, useActiveOrganization } = authClient;

// Export the error message getter for use in components
export { getErrorMessage };
