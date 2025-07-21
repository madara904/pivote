/* eslint-disable @typescript-eslint/no-unused-vars */
import type { BetterFetch } from '@better-fetch/fetch';
import { errorMessages, type SupportedLanguage } from './error-messages';

const fallbackMessages = {
  de: "Ein unbekannter Fehler ist aufgetreten",
  en: "An unknown error occurred",
  fr: "Une erreur inconnue s'est produite",
} as const;

export interface LanguageClientOptions {
  language: SupportedLanguage;
}

export const languageClient = (options: LanguageClientOptions) => {
  const { language } = options;
  
  const getErrorMessage = (code: string): string => {
    const errorMessagesForLanguage = errorMessages[language];
    const fallbackMessage = fallbackMessages[language];

    if (code in errorMessagesForLanguage) {
      return errorMessagesForLanguage[code as keyof typeof errorMessagesForLanguage];
    }
    return fallbackMessage;
  };

  return {
    id: "language",
    getActions: ($fetch: BetterFetch) => ({
      language: {
        getErrorMessage,
        getCurrentLanguage: () => language,
      },
    }),
    getAtoms: ($fetch: BetterFetch) => ({}),
  };
}; 