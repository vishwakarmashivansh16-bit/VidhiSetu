import baseLocales from "../data/locales_all.json";
import type { LanguageCode } from "../languages";

const getBaseEnLocale = (): Record<string, string> => (baseLocales as any).en || {};

const localeCache: Partial<Record<LanguageCode, Record<string, string>>> = {};

const getResolvedLocale = (language: LanguageCode): Record<string, string> => {
  if (localeCache[language]) {
    return localeCache[language]!;
  }
  const base = (baseLocales as any)[language] as Record<string, string> | undefined;
  // If the language is not fully generated yet, fallback to English for any missing keys
  const resolved = {
    ...(getBaseEnLocale()),
    ...(base || {}),
  };
  localeCache[language] = resolved;
  return resolved;
};
export const t = (
  language: LanguageCode,
  key: string,
  params?: Record<string, any>
): string => {
  const resolved = getResolvedLocale(language);
  let text = resolved[key] || getBaseEnLocale()[key] || key;

  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      text = text.replace(`{${k}}`, String(v));
    });
  }

  text = text.replace(/Nyay(?:M|m)itra/g, "VidhiSetu");

  return text;
};

// No-op to maintain API compatibility with App.tsx
export const ensureLanguageLoaded = async (language: LanguageCode): Promise<void> => {
  return;
};

