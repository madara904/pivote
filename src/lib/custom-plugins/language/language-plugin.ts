import type { BetterAuthPlugin } from "better-auth";
import type { SupportedLanguage } from "./error-messages";

export interface LanguagePluginOptions {
  language: SupportedLanguage;
}

export const languagePlugin = (options: LanguagePluginOptions) => ({
  id: "language",
  options: { language: options.language },
} satisfies BetterAuthPlugin); 