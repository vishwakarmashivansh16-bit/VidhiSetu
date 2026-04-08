import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import legalDb from "../data/legalDb.json";
import { getLanguageMeta, type LanguageCode } from "../languages";
import { translateText } from "./translationService";

const GEMINI_API_KEY = (typeof import.meta !== "undefined" && (import.meta as any).env && (import.meta as any).env.VITE_GEMINI_API_KEY) || (typeof process !== "undefined" && process.env.GEMINI_API_KEY) || "AIzaSyAQYr8Dhy74aaUzSUZ4jm6HGzCRVHPq4GQ";
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
if (!GEMINI_API_KEY) {
  // Helps users resolve runtime "API error" quickly.
  console.warn(
    "Missing GEMINI_API_KEY. Set it in .env (vite.config.ts already exposes process.env.GEMINI_API_KEY to the client)."
  );
}

const MODEL = "gemini-2.0-flash";

export interface LegalAnswer {
  crime: string;
  section: string;
  law: string;
  punishment: string;
  explanation: string;
  ipc_ref?: string;
  error?: string;
}

export interface SolveResult {
  answer: LegalAnswer;
  status: string;
  attempts: number;
}

// ─── Synonym map (expanded to cover all legalDb crimes + common queries) ──────
const CRIME_SYNONYMS: Record<string, string> = {
  // Hindi words
  "chori": "Theft",
  "chor": "Theft",
  "dakaiti": "Robbery",
  "daka": "Robbery",
  "hatya": "Murder",
  "khoon": "Murder",
  "maar diya": "Murder",
  "maar dala": "Murder",
  "rape kiya": "Rape",
  "balatkar": "Rape",
  "dhoka": "Cheating",
  "dhokha": "Cheating",
  "fraud kiya": "Fraud / Cheating",
  "paise chura": "Theft",
  "ghar mein ghusa": "Burglary / House-breaking",
  "darr": "Criminal Intimidation",
  "dhamki": "Criminal Intimidation",
  "maar peet": "Grievous Hurt",
  "pitai": "Grievous Hurt",
  "kidnap kiya": "Kidnapping (General & of Women)",
  "apaharan": "Kidnapping (General & of Women)",
  "dahej": "Dowry Death",
  "dahej maut": "Dowry Death",
  "nasha": "Illegal Drug Trade",
  "rishwat": "Bribery (Taking a Bribe — Public Servant)",
  "ghoos": "Bribery (Taking a Bribe — Public Servant)",
  "jhooth": "False Statement / Perjury",
  "nakli": "Forgery",
  "online thagi": "Cheating & Fraud",
  "cyber thagi": "Cheating & Fraud",

  // Murder / Homicide
  "murder": "Murder",
  "kill": "Murder",
  "killed": "Murder",
  "homicide": "Murder",
  "culpable homicide": "Murder",
  "attempt to murder": "Attempt to Murder",
  "attempt to kill": "Attempt to Murder",
  "try to kill": "Attempt to Murder",
  "tried to kill": "Attempt to Murder",

  // Theft / Robbery
  "steal": "Theft",
  "stole": "Theft",
  "stolen": "Theft",
  "theft": "Theft",
  "pickpocket": "Theft",
  "shoplift": "Theft",
  "shoplifting": "Theft",
  "robbery": "Robbery",
  "robbed": "Robbery",
  "snatching": "Robbery",
  "dacoity": "Robbery",
  "burglary": "Burglary / House-breaking",
  "house breaking": "Burglary / House-breaking",
  "housebreaking": "Burglary / House-breaking",
  "broke into": "Burglary / House-breaking",

  // Fraud / Cheating
  "cheat": "Cheating",
  "cheated": "Cheating",
  "fraud": "Fraud / Cheating",
  "scam": "Fraud / Cheating",
  "scammed": "Fraud / Cheating",
  "deceive": "Cheating",
  "deceived": "Cheating",
  "forgery": "Forgery",
  "forged": "Forgery",
  "fake document": "Forgery",
  "counterfeit": "Selling Counterfeit Goods",

  // Sexual offences
  "rape": "Rape",
  "raped": "Rape",
  "sexual assault": "Sexual Harassment",
  "sexual harassment": "Sexual Harassment",
  "molest": "Sexual Harassment",
  "molestation": "Sexual Harassment",
  "stalk": "Stalking",
  "stalking": "Stalking",
  "stalked": "Stalking",
  "voyeur": "Voyeurism",
  "acid attack": "Acid Attack",
  "acid thrown": "Acid Attack",
  "gang rape": "Gang Rape",
  "outrage modesty": "Assault with intent to outrage modesty",

  // Domestic / Family
  "domestic violence": "Cruelty by husband or his relatives",
  "dowry": "Dowry Death",
  "dowry death": "Dowry Death",
  "dowry harassment": "Cruelty by husband or his relatives",
  "cruelty by husband": "Cruelty by husband or his relatives",
  "kidnap": "Kidnapping (General & of Women)",
  "kidnapping": "Kidnapping (General & of Women)",
  "abduct": "Kidnapping (General & of Women)",
  "abduction": "Kidnapping (General & of Women)",

  // Hurt / Assault
  "assault": "Assault with intent to outrage modesty",
  "hurt badly": "Grievous Hurt",
  "grievous hurt": "Grievous Hurt",
  "grievous": "Grievous Hurt",
  "beat up": "Grievous Hurt",
  "attacked": "Grievous Hurt",

  // Cyber crimes
  "cyber fraud": "Cheating & Fraud",
  "online fraud": "Cheating & Fraud",
  "upi fraud": "Cheating & Fraud",
  "phishing": "Cheating & Fraud",
  "impersonation": "Impersonation",
  "impersonate": "Impersonation",
  "fake identity": "Impersonation",
  "hacking": "Cheating & Fraud",
  "digital arrest": "Cheating & Fraud",
  "organised crime": "Organised Crime",

  // Public order
  "riot": "Rioting",
  "rioting": "Rioting",
  "unlawful assembly": "Unlawful Assembly",
  "mob": "Unlawful Assembly",
  "communal violence": "Promoting Enmity Between Groups",
  "hate speech": "Promoting Enmity Between Groups",
  "obstruct police": "Obstructing a Public Servant",
  "obstruct officer": "Obstructing a Public Servant",

  // State offences
  "sedition": "Sedition / Acts Against Sovereignty",
  "terrorism": "Terrorist Act",
  "terrorist": "Terrorist Act",
  "waging war": "Waging War Against the Government of India",

  // Road / Traffic
  "drunk driving": "Drunk Driving (DUI)",
  "dui": "Drunk Driving (DUI)",
  "drink and drive": "Drunk Driving (DUI)",
  "rash driving": "Rash / Dangerous Driving",
  "dangerous driving": "Rash / Dangerous Driving",
  "hit and run": "Hit and Run (causing grievous hurt)",
  "road accident": "Causing Death by Negligent Driving",
  "negligent driving": "Causing Death by Negligent Driving",
  "no licence": "Driving Without Licence",
  "without licence": "Driving Without Licence",

  // Children
  "child abuse": "Sexual Assault on a Child (POCSO)",
  "pocso": "Sexual Assault on a Child (POCSO)",
  "child labour": "Child Labour (Hazardous Work)",
  "child trafficking": "Child Trafficking",
  "abandon child": "Abandonment of a Child (under 12 years)",

  // Defamation / Privacy
  "defamation": "Defamation",
  "defame": "Defamation",
  "slander": "Defamation",
  "libel": "Defamation",
  "obscene": "Publishing Obscene Material",
  "threat": "Criminal Intimidation",
  "threatening message": "Sending Threatening / Obscene Messages (Online)",
  "intimidation": "Criminal Intimidation",

  // Corruption
  "bribe": "Bribery (Taking a Bribe — Public Servant)",
  "bribery": "Bribery (Taking a Bribe — Public Servant)",
  "corruption": "Bribery (Taking a Bribe — Public Servant)",
  "perjury": "False Statement / Perjury",
  "false evidence": "Fabricating False Evidence",
  "disproportionate assets": "Disproportionate Assets",

  // Trafficking / Other
  "human trafficking": "Human Trafficking",
  "trafficking": "Human Trafficking",
  "drug": "Illegal Drug Trade",
  "drugs": "Illegal Drug Trade",
  "narcotics": "Illegal Drug Trade",
  "poaching": "Poaching",
};

// ─── Build a flat index of all crimes from legalDb for fast lookup ─────────────
const DB_CRIME_INDEX: { crime: string; data: any }[] = [];
for (const category of legalDb.categories) {
  for (const item of category.crimes) {
    DB_CRIME_INDEX.push({ crime: item.crime.toLowerCase(), data: item });
  }
}

// ─── Extract the best matching crime from the question ────────────────────────
export const extractCrime = (question: string): string | null => {
  const q = question.toLowerCase();

  // 1. Check synonym map (longest phrase match wins)
  const synonymMatches = Object.entries(CRIME_SYNONYMS)
    .filter(([phrase]) => q.includes(phrase))
    .sort((a, b) => b[0].length - a[0].length); // prefer longer matches

  if (synonymMatches.length > 0) return synonymMatches[0][1];

  // 2. Direct DB crime name match (longest match wins)
  const dbMatches = DB_CRIME_INDEX
    .filter(({ crime }) => q.includes(crime))
    .sort((a, b) => b.crime.length - a.crime.length);

  if (dbMatches.length > 0) return dbMatches[0].data.crime;

  return null;
};

// ─── Fetch verified law data from DB ─────────────────────────────────────────
export const fetchLaw = (crime: string) => {
  const lower = crime.toLowerCase();
  for (const category of legalDb.categories) {
    const found = category.crimes.find(c => c.crime.toLowerCase() === lower);
    if (found) return found;
  }
  return null;
};

// ─── Build a compact DB summary (avoids dumping full JSON into prompt) ────────
const buildDbSummary = (): string => {
  return legalDb.categories.map(cat =>
    `[${cat.name}]\n` +
    cat.crimes.map(c => `  - ${c.crime} | BNS: ${c.bns} | Punishment: ${c.punishment} | IPC ref: ${c.ipc_ref}`).join("\n")
  ).join("\n\n");
};

const DB_SUMMARY = buildDbSummary();

// ─── System instruction (persistent persona) ─────────────────────────────────
const SYSTEM_INSTRUCTION = `You are VidhiSetu, a friendly and knowledgeable Indian legal assistant specialising in the Bharatiya Nyaya Sanhita (BNS) 2023, which replaced the Indian Penal Code (IPC) 1860.

CRITICAL RULES — NEVER BREAK THESE:
- ALWAYS give a helpful, informative answer to EVERY question — never say "I can't help", "I don't know", or "please consult someone else" as your ONLY response
- If a question is outside Indian law, still answer helpfully using your general knowledge
- If asked about general topics (history, science, math, etc.), answer them — you are a helpful AI, not just a legal bot
- NEVER refuse to answer. NEVER say "I encountered an error" or "I'm having trouble"
- Be conversational, warm, and clear — like a knowledgeable friend

Your legal expertise:
- Explain Indian laws accurately, citing BNS sections
- Always mention BNS section numbers when relevant
- Explain punishments clearly in plain language  
- Be empathetic — users may be in distress
- For serious cases, suggest consulting a lawyer IN ADDITION to your answer (never instead of)
- Keep explanations concise but complete
- If asked in Hindi or any Indian language, respond in that language

You have access to a verified legal database. Always prefer database information over general knowledge.`;

// ─── Generate answer using Gemini ─────────────────────────────────────────────
export const generateAnswer = async (
  question: string,
  lawData: any,
  lang: string = "en",
  conversationHistory: { role: string; content: string }[] = []
): Promise<LegalAnswer> => {
  const langCode = lang as LanguageCode;
  const langTargetPromptName = getLanguageMeta(langCode).promptName;

  const buildLocalAnswer = async (): Promise<LegalAnswer> => {
    const baseCrime = lawData?.crime || "General Legal Information";
    const baseSection = lawData?.bns ? `BNS Section ${lawData.bns}` : "";
    const baseLaw = "Bharatiya Nyaya Sanhita (BNS), 2023";
    const basePunishment = lawData?.punishment || "Please consult a qualified legal professional for guidance on your specific situation.";

    const explanationEn = lawData
      ? `This answer is based on verified legal information. ${baseSection} deals with the relevant offence and outlines the legal consequences. The punishment under this provision is: ${basePunishment}. If you are dealing with a real case, document the facts carefully and consider consulting a lawyer so you can take the correct legal steps.`
      : `This answer is based on general legal information. If your question relates to a specific incident, share the key facts (what happened, when, and any evidence) so the relevant provision can be identified accurately. For any urgent or serious matter, consult a qualified lawyer to understand your options and next steps.`;

    if (langCode === "en") {
      return {
        crime: baseCrime,
        section: baseSection,
        law: baseLaw,
        punishment: basePunishment,
        explanation: explanationEn,
        ipc_ref: lawData?.ipc_ref,
      };
    }

    // Translate values into the target language for better UX.
    // If translation fails, we fall back to English.
    const safeTranslate = async (v: string) => {
      try {
        return await translateText(v, langTargetPromptName);
      } catch {
        return v;
      }
    };

    return {
      crime: await safeTranslate(baseCrime),
      section: await safeTranslate(baseSection),
      law: baseLaw, // keep law name in English for consistency
      punishment: await safeTranslate(basePunishment),
      explanation: await safeTranslate(explanationEn),
      ipc_ref: lawData?.ipc_ref,
    };
  };

  // If Gemini isn't available (missing/invalid API key), respond from DB.
  if (!GEMINI_API_KEY) {
    return buildLocalAnswer();
  }

  const langHint =
    langCode !== "en"
      ? `\nIMPORTANT: Write ALL string values in the JSON ("crime","section","law","punishment","explanation","ipc_ref" if present) in "${getLanguageMeta(langCode).promptName}". All JSON keys must remain in English.\n`
      : "";

  const contextStr = lawData
    ? `## Verified Legal Data (use this strictly)\n\`\`\`json\n${JSON.stringify(lawData, null, 2)}\n\`\`\``
    : `## Reference Legal Database\nNo exact match found. Use the closest relevant entry from this database:\n\n${DB_SUMMARY}\n\nIf nothing matches, answer from your knowledge of BNS 2023.`;

  const prompt = `${SYSTEM_INSTRUCTION}

${contextStr}
${langHint}
## Instructions
You MUST respond with ONLY a raw JSON object. No markdown, no code fences, no explanation outside the JSON.

{
  "crime": "exact crime name from database, or topic name for general questions",
  "section": "BNS Section [number], or empty string if not applicable",
  "law": "Bharatiya Nyaya Sanhita (BNS), 2023, or relevant law name",
  "punishment": "exact punishment as per BNS, or empty string if not applicable",
  "explanation": "ALWAYS provide a helpful, complete answer in 3-6 sentences. For legal questions: what the law says, who it protects, what to do next. For general questions: answer directly and helpfully. NEVER say you cannot help.",
  "ipc_ref": "old IPC section for reference (optional, omit if not relevant)"
}

ABSOLUTE RULES:
- ALWAYS fill "explanation" with a real, helpful answer — never leave it empty or say you cannot help
- For non-legal questions, still answer helpfully in the "explanation" field
- NEVER fabricate BNS section numbers — leave "section" empty if unsure
- Start your response with { and end with } — nothing else
- The JSON must be valid and parseable

## Conversation context (last 4 messages)
${conversationHistory.slice(-4).map(m => `${m.role}: ${m.content}`).join("\n")}

## Current question
${question}`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.1,
      }
    });

    const raw = response.text?.trim() || "{}";
    // Strip markdown code fences if model wraps JSON in ```json ... ```
    const cleaned = raw
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    // Sometimes models return extra text; extract the first JSON object.
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) throw new Error(`Failed to find JSON object in response: ${raw.slice(0, 200)}`);

    const parsed = JSON.parse(match[0]);

    // Normalise section format
    if (parsed.section && !parsed.section.toLowerCase().startsWith("bns")) {
      parsed.section = `BNS Section ${parsed.section}`;
    }

    return parsed;
  } catch (error: any) {
    const errMsg = error?.message || error?.toString() || "Unknown error";
    console.error("Gemini Error:", errMsg);
    // If Gemini fails, still try DB-based fallback.
    if (lawData) {
      try {
        return await buildLocalAnswer();
      } catch {
        // ignore and return error below
      }
    }

    return {
      crime: "General Legal Information",
      section: "",
      law: "Bharatiya Nyaya Sanhita (BNS), 2023",
      punishment: lawData?.punishment || "",
      explanation: lawData
        ? `Under BNS ${lawData.bns}, ${lawData.crime} carries the following punishment: ${lawData.punishment}. This law is part of the Bharatiya Nyaya Sanhita 2023 which replaced the Indian Penal Code. If you are facing this situation, document all evidence carefully and consider consulting a lawyer for your specific case.`
        : "I'm here to help with any legal question about Indian law. Please rephrase your question and I'll do my best to provide accurate information about the relevant BNS sections, punishments, and your legal rights.",
      error: errMsg,
      ipc_ref: lawData?.ipc_ref,
    };
  }
};

// ─── Strict grading against verified DB data ──────────────────────────────────
export const gradeAnswer = (answer: LegalAnswer, correctData: any): number => {
  let score = 0;

  // Check BNS section accuracy — handle multi-section entries like "63, 65"
  const expectedSections = String(correctData.bns).split(",").map((s: string) => s.trim());
  const gotSection = answer.section || "";
  const sectionMatch = expectedSections.some(s => gotSection.includes(s));
  if (sectionMatch) score += 2;

  // Check punishment is present and non-trivial
  if (answer.punishment && answer.punishment.length > 10) score += 1;

  // Check explanation quality
  if (answer.explanation && answer.explanation.length > 50) score += 1;

  // Check law name is correct
  if (answer.law && answer.law.toLowerCase().includes("bns")) score += 1;

  return score; // max 5
};

// ─── Main solve function ───────────────────────────────────────────────────────
const GREETINGS = ["hi", "hello", "hey", "namaste", "namaskar", "hii", "helo", "good morning", "good evening", "good afternoon"];

export const solve = async (
  question: string,
  lang: string = "en",
  conversationHistory: { role: string; content: string }[] = []
): Promise<SolveResult> => {
  const q = question.trim().toLowerCase();

  // Short-circuit for greetings — no need to hit the API
  if (GREETINGS.some(g => q === g || q === g + "!" || q === g + ".")) {
    return {
      answer: {
        crime: "General Legal Information",
        section: "",
        law: "",
        punishment: "",
        explanation: lang === "hi"
          ? "नमस्ते! मैं विधिसेतु हूँ। आप मुझसे भारतीय कानून, BNS धाराएं, अपने अधिकार, या किसी भी कानूनी प्रक्रिया के बारे में पूछ सकते हैं।"
          : "Hello! I'm VidhiSetu, your Indian legal assistant. Ask me about any law, BNS section, your rights, or legal procedures — I'm here to help."
      },
      status: "ℹ️ General Info",
      attempts: 0
    };
  }

  const crime = extractCrime(question);
  const lawData = crime ? fetchLaw(crime) : null;

  let answer: LegalAnswer = { crime: "", section: "", law: "", punishment: "", explanation: "" };
  const maxAttempts = 2;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const questionWithRetryHint = attempt > 1
      ? `${question}\n\n[Retry: Make sure to provide a complete, helpful answer in the explanation field. Do not leave it empty.]`
      : question;

    answer = await generateAnswer(questionWithRetryHint, lawData, lang, conversationHistory);

    // Accept any answer that has a real explanation
    if (answer.explanation && answer.explanation.length > 30) {
      const status = lawData && gradeAnswer(answer, lawData) >= 3
        ? "✅ Passed"
        : answer.crime && answer.crime !== "General Legal Information"
          ? "ℹ️ Found in Reference"
          : "ℹ️ General Info";
      return { answer, status, attempts: attempt };
    }
  }

  // Last resort fallback - always give something useful
  if (!answer.explanation || answer.explanation.length < 30) {
    answer.explanation = lawData
      ? `**${lawData.crime}** is covered under **BNS Section ${lawData.bns}**.\n\n**Punishment:** ${lawData.punishment}\n\nThis falls under the Bharatiya Nyaya Sanhita (BNS) 2023, which replaced the Indian Penal Code. ${lawData.ipc_ref ? `Previously this was IPC Section ${lawData.ipc_ref}.` : ''} If you are facing this situation, document all evidence and consider consulting a qualified lawyer.`
      : "I can help you with any question about Indian law, BNS sections, your legal rights, or legal procedures. Please ask your question in more detail and I'll provide accurate information.";
    if (lawData) {
      answer.crime = lawData.crime;
      answer.section = `BNS Section ${lawData.bns}`;
      answer.punishment = lawData.punishment;
      answer.law = "Bharatiya Nyaya Sanhita (BNS), 2023";
    }
  }

  return {
    answer,
    status: lawData ? "⚠️ Low Confidence" : "ℹ️ General Info",
    attempts: maxAttempts
  };
};

// ─── Dynamic Case Complexity Evaluator (OpenEnv Simulator) ───────────────────
export interface CaseComplexityResult {
  complexityScore: number; // 0.0 to 10.0
  severityLevel: "Low" | "Medium" | "High" | "Extreme";
  crimesIdentified: string[];
  bnsSections: string[];
  ipcSections: string[];
  aggravatingFactors: string[];
  analysis: string;
}

export const evaluateCaseComplexity = async (scenario: string): Promise<CaseComplexityResult> => {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing. Cannot evaluate case complexity.");
  }

  const prompt = `You are an elite Indian Legal Strategist and AI Assessor. 
Analyze the following imaginary or real legal scenario provided by the user.
Identify all the concurrent crimes, the applicable Bharatiya Nyaya Sanhita (BNS) 2023 sections, aggravating factors, and determine the overall complexity of the case.

Scenario:
"${scenario}"

Evaluate it and return ONLY a raw JSON object (no markdown, no backticks). Follow this exact structure:
{
  "complexityScore": 8.5,
  "severityLevel": "High",
  "crimesIdentified": ["Murder", "Forgery", "Criminal Conspiracy"],
  "bnsSections": ["BNS 103", "BNS 318", "BNS 61"],
  "ipcSections": ["IPC 302", "IPC 463", "IPC 120B"],
  "aggravatingFactors": ["Pre-meditation", "Involvement of property dispute"],
  "analysis": "A detailed 4-5 sentence strategic breakdown explaining the overlapping charges."
}
IMPORTANT: Provide valid JSON only. Do not include trailing commas or comments.`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: {
        temperature: 0.1, // Lower temperature for more stable JSON
        responseMimeType: "application/json",
      }
    });

    const raw = response.text || "{}";
    const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) {
      console.error("No JSON braces matched. Raw response:", raw);
      throw new Error("Invalid output format from AI.");
    }
    
    return JSON.parse(match[0]) as CaseComplexityResult;
  } catch (error: any) {
    console.warn("API Unavailable - Falling back to Local Heuristic Evaluator:", error.message || error);
    
    // Offline / Mock deterministic fallback engine for API quota exhaustion
    const lowercase = scenario.toLowerCase();
    const crimes: string[] = [];
    const bns: string[] = [];
    const ipc: string[] = [];
    const factors: string[] = [];
    let score = 5.0;
    
    if (lowercase.includes("murder") || lowercase.includes("kill") || lowercase.includes("poison") || lowercase.includes("death")) {
      crimes.push("Murder");
      bns.push("BNS 103");
      ipc.push("IPC 302");
      score += 4.5;
    }
    if (lowercase.includes("property") || lowercase.includes("land") || lowercase.includes("fraud") || lowercase.includes("forgery")) {
      crimes.push("Fraudulent Deeds / Cheating");
      bns.push("BNS 318");
      ipc.push("IPC 420");
      score += 2.0;
      factors.push("Involvement of high-value property or forged documents");
    }
    if (lowercase.includes("steal") || lowercase.includes("theft") || lowercase.includes("embezzle") || lowercase.includes("crypto") || lowercase.includes("bank")) {
      crimes.push("Corporate Theft / Criminal Breach of Trust");
      bns.push("BNS 303");
      bns.push("BNS 316");
      ipc.push("IPC 378");
      ipc.push("IPC 405");
      score += 2.5;
      factors.push("Corporate or digital embezzlement dimension");
    }
    if (lowercase.includes("rape") || lowercase.includes("assault") || lowercase.includes("harass")) {
      crimes.push("Sexual Assault / Harassment");
      bns.push("BNS 63");
      ipc.push("IPC 376");
      score += 4.5;
      factors.push("Heinous crime against bodily autonomy");
    }
    if (lowercase.includes("bribe") || lowercase.includes("extort")) {
      crimes.push("Extortion / Bribery");
      bns.push("BNS 308");
      ipc.push("IPC 383");
      score += 2.5;
      factors.push("Abuse of power / coercion");
    }

    if (crimes.length === 0) {
      crimes.push("General Dispute or Misdemeanor");
      bns.push("BNS General Provisions");
      ipc.push("IPC General Extents");
      score = 3.5;
    }

    if (crimes.length > 1 && !factors.includes("Multiple concurrent offenses")) {
      factors.push("Multiple concurrent offenses");
      score += 1.5;
    }
    
    score = Math.min(score, 9.9);
    let severity: "Low" | "Medium" | "High" | "Extreme" = "Low";
    if (score >= 8.5) severity = "Extreme";
    else if (score >= 6.5) severity = "High";
    else if (score >= 4.0) severity = "Medium";

    return {
      complexityScore: parseFloat(score.toFixed(1)),
      severityLevel: severity,
      crimesIdentified: [...new Set(crimes)],
      bnsSections: [...new Set(bns)],
      ipcSections: [...new Set(ipc)],
      aggravatingFactors: factors.length > 0 ? factors : ["Standard procedural violation context"],
      analysis: `(Heuristic Assessment Mode) The AI generation endpoint is temporarily unavailable. Based on an algorithmic native scan, this scenario triggers ${crimes.length} major jurisdictional overlaps resulting in a ${severity} severity classification. Please monitor api quotas to restore cloud processing.`
    };
  }
};
