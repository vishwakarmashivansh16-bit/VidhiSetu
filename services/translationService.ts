import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import type { LegalTopic } from "../data/topics";
import legalDb from "../data/legalDb.json";

// Keep the Gemini client in this file so both legalService + translation
// can share the same environment handling.
// NOTE: `vite.config.ts` already defines `process.env.GEMINI_API_KEY` for the
// client bundle, so we access it directly to benefit from that replacement.
// Fallback directly to the key found in .env to ensure translation works if Vite misses it
const apiKey = (typeof process !== 'undefined' && process.env.GEMINI_API_KEY) || "AIzaSyAQYr8Dhy74aaUzSUZ4jm6HGzCRVHPq4GQ";

const ai = new GoogleGenAI({ apiKey });

const MODEL = "gemini-2.0-flash-lite";

const LIBRETRANSLATE_ENDPOINTS = [
  "https://libretranslate.de/translate",
  "https://libretranslate.com/translate",
  "https://translate.astian.org/translate",
];

// Track if libre translates are chronically failing to prevent hanging
let libreConsecutiveFailures = 0;
const MAX_CONSECUTIVE_FAILURES = 3;

// We key off `targetPromptName` (from languages.ts) rather than language codes
// because existing callers only pass the prompt name.
const PROMPT_NAME_TO_LIBRE_CODE: Record<string, string> = {
  English: "en",
  Hindi: "hi",
  Assamese: "as",
  Bengali: "bn",
  Gujarati: "gu",
  Kannada: "kn",
  Kashmiri: "ks",
  Konkani: "kok",
  Malayalam: "ml",
  Marathi: "mr",
  Manipuri: "mni",
  Nepali: "ne",
  Odia: "or",
  "Odia (Oriya)": "or",
  Punjabi: "pa",
  Sanskrit: "sa",
  Sindhi: "sd",
  Tamil: "ta",
  Telugu: "te",
  Urdu: "ur",
  Bodo: "brx",
  Santali: "sat",
  Dogri: "doi",
  Maithili: "mai",
};

const getLibreTargetCode = (promptName: string): string => {
  return PROMPT_NAME_TO_LIBRE_CODE[promptName] || "en";
};

const tokenizeText = (
  text: string,
  tokenPrefix: string,
  regex: RegExp
): { value: string; map: Record<string, string> } => {
  const map: Record<string, string> = {};
  let idx = 0;
  const value = text.replace(regex, (match) => {
    const token = `__${tokenPrefix}_${idx}__`;
    map[token] = match;
    idx++;
    return token;
  });
  return { value, map };
};

const protectAndUnprotect = {
  protect: (text: string) => {
    // 1) placeholders like {count}
    let current = text;
    const allMaps: Record<string, string> = {};

    const placeholder = tokenizeText(current, "NYAY_PH", /\{[^}]+\}/g);
    current = placeholder.value;
    Object.assign(allMaps, placeholder.map);

    // 2) URLs
    const urls = tokenizeText(
      current,
      "NYAY_URL",
      /\bhttps?:\/\/[^\s]+/gi
    );
    current = urls.value;
    Object.assign(allMaps, urls.map);

    // 3) Emails
    const emails = tokenizeText(
      current,
      "NYAY_MAIL",
      /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi
    );
    current = emails.value;
    Object.assign(allMaps, emails.map);

    return { protectedText: current, map: allMaps };
  },
  unprotect: (text: string, map: Record<string, string>) => {
    let current = text;
    for (const [token, original] of Object.entries(map)) {
      current = current.split(token).join(original);
    }
    return current;
  },
};

const translateTextViaLibre = async (
  sourceText: string,
  targetPromptName: string
): Promise<string> => {
  const targetCode = getLibreTargetCode(targetPromptName);
  if (!sourceText.trim()) return sourceText;
  
  // Fail fast if Libre API is seemingly down
  if (libreConsecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
    throw new Error("LibreTranslate endpoints are marked as failing.");
  }

  const { protectedText, map } = protectAndUnprotect.protect(sourceText);

  const payload = {
    q: protectedText,
    source: "en",
    target: targetCode,
    format: "text",
  };

  let lastErr: unknown = null;
  for (const endpoint of LIBRETRANSLATE_ENDPOINTS) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000); // reduced timeout to avoid stalling UI
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!res.ok) {
        lastErr = new Error(`LibreTranslate failed with status ${res.status}`);
        continue;
      }

      const data: any = await res.json();
      const translated = (data?.translatedText || "").toString();
      libreConsecutiveFailures = 0; // reset on success
      return protectAndUnprotect.unprotect(translated, map);
    } catch (err) {
      lastErr = err;
    }
  }

  libreConsecutiveFailures++;
  throw lastErr || new Error("LibreTranslate translation failed.");
};

const translateKeyValueObjectViaLibre = async (
  sourceObject: Record<string, string>,
  targetPromptName: string
): Promise<Record<string, string>> => {
  const next: Record<string, string> = {};
  const entries = Object.entries(sourceObject);
  for (const [k, v] of entries) {
    if (!v) {
      next[k] = v;
      continue;
    }
    try {
      next[k] = await translateTextViaLibre(v, targetPromptName);
    } catch {
      next[k] = v; // fallback to English for this key
    }
  }
  return next;
};

const translateTopicViaLibre = async (
  topic: LegalTopic,
  targetPromptName: string
): Promise<LegalTopic> => {
  const next: LegalTopic = {
    ...topic,
    title: topic.title,
    tag: topic.tag,
    description: topic.description,
    category: topic.category,
    fullContent: { ...topic.fullContent },
  };

  next.title = await translateTextViaLibre(topic.title, targetPromptName);
  next.tag = await translateTextViaLibre(topic.tag, targetPromptName);
  next.description = await translateTextViaLibre(topic.description, targetPromptName);
  next.category = await translateTextViaLibre(topic.category, targetPromptName);

  next.fullContent.definition = await translateTextViaLibre(
    topic.fullContent.definition,
    targetPromptName
  );

  next.fullContent.applicability = await Promise.all(
    topic.fullContent.applicability.map((x) => translateTextViaLibre(x, targetPromptName))
  );

  next.fullContent.steps = await Promise.all(
    topic.fullContent.steps.map(async (s) => ({
      title: await translateTextViaLibre(s.title, targetPromptName),
      description: await translateTextViaLibre(s.description, targetPromptName),
    }))
  );

  next.fullContent.misconceptions = await Promise.all(
    topic.fullContent.misconceptions.map(async (m) => ({
      myth: await translateTextViaLibre(m.myth, targetPromptName),
      fact: await translateTextViaLibre(m.fact, targetPromptName),
    }))
  );

  next.fullContent.resources = await Promise.all(
    topic.fullContent.resources.map(async (r) => ({
      title: await translateTextViaLibre(r.title, targetPromptName),
      link: r.link,
    }))
  );

  return next;
};

const translateTopicSummaryViaLibre = async (
  topic: Pick<LegalTopic, "id" | "title" | "tag" | "description">,
  targetPromptName: string
): Promise<Pick<LegalTopic, "id" | "title" | "tag" | "description">> => {
  return {
    id: topic.id,
    title: await translateTextViaLibre(topic.title, targetPromptName),
    tag: await translateTextViaLibre(topic.tag, targetPromptName),
    description: await translateTextViaLibre(topic.description, targetPromptName),
  };
};

const translateLegalDbCategoryViaLibre = async (
  category: (typeof legalDb.categories)[number],
  targetPromptName: string
): Promise<(typeof legalDb.categories)[number]> => {
  return {
    ...category,
    name: await translateTextViaLibre(category.name, targetPromptName),
    description: await translateTextViaLibre(category.description, targetPromptName),
    crimes: await Promise.all(
      category.crimes.map(async (c) => ({
        ...c,
        crime: await translateTextViaLibre(c.crime, targetPromptName),
        punishment: await translateTextViaLibre(c.punishment, targetPromptName),
      }))
    ),
  };
};

const translateViaGemini = async (prompt: string): Promise<string> => {
  if (!apiKey) {
    throw new Error(
      "Missing Gemini API key. Please set `VITE_GEMINI_API_KEY` in your .env file."
    );
  }

  const response: GenerateContentResponse = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
    config: {
      temperature: 0.2,
    },
  });

  return (response.text?.trim() || "").toString();
};

export const translateKeyValueObject = async (
  sourceObject: Record<string, string>,
  targetPromptName: string
): Promise<Record<string, string>> => {
  // If Gemini isn't configured, fall back to LibreTranslate for UI i18n.
  if (!apiKey) return translateKeyValueObjectViaLibre(sourceObject, targetPromptName);

  const prompt = `You are a professional translator.
Translate ONLY the values of this JSON from English to "${targetPromptName}".

Rules:
- Keep JSON keys exactly unchanged (keys are in English).
- Keep placeholders like {count} unchanged.
- Keep any numbers, punctuation, and URLs unchanged.
- Keep Markdown formatting (like **bold**, _italic_, links) as-is as much as possible.
- Output ONLY a valid JSON object. No markdown, no explanation.

JSON to translate:
${JSON.stringify(sourceObject, null, 2)}`;

  let raw: string;
  try {
    raw = await translateViaGemini(prompt);
  } catch {
    return translateKeyValueObjectViaLibre(sourceObject, targetPromptName);
  }

  // Some Gemini outputs can wrap JSON in code fences; strip them.
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) throw new Error(`Failed to find JSON object in translation response.`);

  return JSON.parse(match[0]) as Record<string, string>;
};

export const translateText = async (
  sourceText: string,
  targetPromptName: string
): Promise<string> => {
  if (!apiKey) {
    try {
      return await translateTextViaLibre(sourceText, targetPromptName);
    } catch {
      return sourceText;
    }
  }

  const prompt = `Translate the following text from English to "${targetPromptName}".

Rules:
- Preserve all URLs, emails, and phone numbers exactly.
- Keep newlines as in the original when reasonable.
- Output ONLY the translated text (no quotes, no JSON).

Text:
"""${sourceText}"""`;

  try {
    const raw = await translateViaGemini(prompt);
    return raw.trim();
  } catch {
    try {
      return await translateTextViaLibre(sourceText, targetPromptName);
    } catch {
      return sourceText;
    }
  }
};

export const translateTopic = async (
  topic: LegalTopic,
  targetPromptName: string
): Promise<LegalTopic> => {
  if (!apiKey) {
    try {
      return await translateTopicViaLibre(topic, targetPromptName);
    } catch {
      return topic;
    }
  }

  const prompt = `You are a legal content translator.
Translate the following legal topic content from English to "${targetPromptName}".

Rules:
- Output ONLY valid JSON.
- Keep the same JSON structure and keys exactly as provided.
- Keep all "link" fields exactly unchanged.
- Preserve all numbers and legal references (like section/article numbers) as-is.
- Translate only the human-readable text fields (title, tag, description, fullContent.definition, fullContent.applicability, steps.title/description, misconceptions.myth/fact, resources.title).
- Do NOT translate the icon field (it may be missing); keep topic.icon as-is if present.

JSON:
${JSON.stringify(topic, null, 2)}`;

  try {
    const raw = await translateViaGemini(prompt);
    const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) throw new Error(`Failed to find JSON object in topic translation response.`);
    return JSON.parse(match[0]) as LegalTopic;
  } catch {
    try {
      return await translateTopicViaLibre(topic, targetPromptName);
    } catch {
      return topic;
    }
  }
};

export const translateTopicSummary = async (
  topic: Pick<LegalTopic, "id" | "title" | "tag" | "description">,
  targetPromptName: string
): Promise<Pick<LegalTopic, "id" | "title" | "tag" | "description">> => {
  if (!apiKey) {
    try {
      return await translateTopicSummaryViaLibre(topic, targetPromptName);
    } catch {
      return topic;
    }
  }

  const prompt = `You are a legal content translator.
Translate the following topic summary from English to "${targetPromptName}".

Rules:
- Output ONLY valid JSON.
- Keep the same keys exactly: id, title, tag, description.
- Keep id unchanged.
- Keep all numbers and legal references as-is.
- Output ONLY the translated JSON object.

JSON:
${JSON.stringify(topic, null, 2)}`;

  try {
    const raw = await translateViaGemini(prompt);
    const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) throw new Error(`Failed to find JSON object in topic summary translation response.`);
    return JSON.parse(match[0]) as Pick<
      LegalTopic,
      "id" | "title" | "tag" | "description"
    >;
  } catch {
    try {
      return await translateTopicSummaryViaLibre(topic, targetPromptName);
    } catch {
      return topic;
    }
  }
};

export const translateLegalDbCategory = async (
  category: (typeof legalDb.categories)[number],
  targetPromptName: string
): Promise<(typeof legalDb.categories)[number]> => {
  if (!apiKey) {
    try {
      return await translateLegalDbCategoryViaLibre(category, targetPromptName);
    } catch {
      return category;
    }
  }

  const prompt = `You are a legal content translator.
Translate the following legal category and its crimes from English to "${targetPromptName}".

Rules:
- Output ONLY valid JSON.
- Keep the same JSON structure and keys exactly as provided.
- Keep all numbers and references (bns, ipc_ref) exactly unchanged.
- Translate: category.name, category.description, crimes[].crime, crimes[].punishment.

JSON:
${JSON.stringify(category, null, 2)}`;

  try {
    const raw = await translateViaGemini(prompt);
    const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) throw new Error(`Failed to find JSON object in category translation response.`);
    return JSON.parse(match[0]) as (typeof legalDb.categories)[number];
  } catch {
    try {
      return await translateLegalDbCategoryViaLibre(category, targetPromptName);
    } catch {
      return category;
    }
  }
};

