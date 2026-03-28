import fs from 'fs';
import { GoogleGenAI } from '@google/genai';

const apiKey = "AIzaSyAQYr8Dhy74aaUzSUZ4jm6HGzCRVHPq4GQ";
const ai = new GoogleGenAI({ apiKey });

const locales = JSON.parse(fs.readFileSync('./data/locales.json', 'utf8'));
const en = locales.en;

const targets = {
  "as": "Assamese",
  "ks": "Kashmiri",
  "mni": "Manipuri",
  "ne": "Nepali",
  "sa": "Sanskrit",
  "sd": "Sindhi",
  "ur": "Urdu",
  "brx": "Bodo",
  "sat": "Santali",
  "doi": "Dogri",
  "bh": "Maithili"
};

async function run() {
  console.log("Starting static locale generation for remaining languages...");
  let changed = false;
  
  for (const [code, lang] of Object.entries(targets)) {
    if (locales[code] && Object.keys(locales[code]).length > 10) {
      console.log(`Skipping ${lang}, already translated.`);
      continue;
    }
    
    console.log(`Translating to ${lang}...`);
    const prompt = `You are a professional translator. Translate ONLY the values of this JSON from English to ${lang}.
    
Rules:
- Keep JSON keys exactly unchanged (keys are in English).
- Keep placeholders like {count} unchanged.
- Keep Markdown formatting as-is.
- Output ONLY a valid JSON object. No markdown, no explanation.

JSON:
${JSON.stringify(en, null, 2)}`;
    
    try {
        const response = await ai.models.generateContent({
             model: "gemini-2.0-flash-lite",
             contents: prompt,
             config: { temperature: 0.1 }
        });
        const text = response.text || "";
        const match = text.match(/\{[\s\S]*\}/);
        if (match) {
            const parsed = JSON.parse(match[0]);
            locales[code] = parsed;
            console.log(`Success for ${lang} (${Object.keys(parsed).length} keys)`);
            changed = true;
        } else {
            console.log(`Failed to parse regex for ${lang}`);
        }
    } catch (e) {
        console.error(`Error for ${lang}:`, e.message);
    }
  }
  
  if (changed) {
      fs.writeFileSync('./data/locales.json', JSON.stringify(locales, null, 2));
      console.log("Saved NEW all-language locales.json successfully!");
  }
}

run();
