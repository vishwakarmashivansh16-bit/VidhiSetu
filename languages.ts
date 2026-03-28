export type LanguageCode =
  | "en"
  | "hi"
  | "as"
  | "bn"
  | "gu"
  | "kn"
  | "ks"
  | "kok"
  | "ml"
  | "mr"
  | "mni"
  | "ne"
  | "or"
  | "pa"
  | "sa"
  | "sd"
  | "ta"
  | "te"
  | "ur"
  | "brx"
  | "sat"
  | "doi"
  | "bh";

export interface LanguageMeta {
  code: LanguageCode;
  name: string;
  // Use a human-friendly language name for Gemini prompts.
  promptName: string;
}

// These are the 22 languages from India's Eighth Schedule (plus English).
// The promptName is used only for translation/generation.
export const SUPPORTED_LANGUAGES: LanguageMeta[] = [
  { code: "en", name: "English", promptName: "English" },
  { code: "hi", name: "Hindi", promptName: "Hindi" },
  { code: "as", name: "Assamese", promptName: "Assamese" },
  { code: "bn", name: "Bengali", promptName: "Bengali" },
  { code: "gu", name: "Gujarati", promptName: "Gujarati" },
  { code: "kok", name: "Konkani", promptName: "Konkani" },
  { code: "ml", name: "Malayalam", promptName: "Malayalam" },
  { code: "mr", name: "Marathi", promptName: "Marathi" },
  { code: "ne", name: "Nepali", promptName: "Nepali" },
  { code: "or", name: "Odia", promptName: "Odia" },
  { code: "pa", name: "Punjabi", promptName: "Punjabi" },
  { code: "sa", name: "Sanskrit", promptName: "Sanskrit" },
  { code: "sd", name: "Sindhi", promptName: "Sindhi" },
  { code: "ta", name: "Tamil", promptName: "Tamil" },
  { code: "te", name: "Telugu", promptName: "Telugu" },
  { code: "ur", name: "Urdu", promptName: "Urdu" },
  { code: "sat", name: "Santali", promptName: "Santali" },
  { code: "doi", name: "Dogri", promptName: "Dogri" },
  { code: "bh", name: "Maithili", promptName: "Maithili" }
];

export const getLanguageMeta = (code: LanguageCode): LanguageMeta => {
  return SUPPORTED_LANGUAGES.find(l => l.code === code) || SUPPORTED_LANGUAGES[0];
};

export const DEFAULT_LANGUAGE: LanguageCode = "en";

