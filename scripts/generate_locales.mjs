import fs from 'fs';
import { GoogleGenAI } from '@google/genai';
import path from 'path';

const apiKey = "AIzaSyAQYr8Dhy74aaUzSUZ4jm6HGzCRVHPq4GQ";
const ai = new GoogleGenAI({ apiKey });

const file = path.join(process.cwd(), 'data', 'locales.json');
const locales = JSON.parse(fs.readFileSync(file, 'utf8'));
const en = locales.en;

const targets = {
  "hi": "Hindi",
  "as": "Assamese",
  "bn": "Bengali",
  "gu": "Gujarati",
  "kn": "Kannada",
  "ks": "Kashmiri",
  "kok": "Konkani",
  "ml": "Malayalam",
  "mr": "Marathi",
  "mni": "Manipuri",
  "ne": "Nepali",
  "or": "Odia",
  "pa": "Punjabi",
  "sa": "Sanskrit",
  "sd": "Sindhi",
  "ta": "Tamil",
  "te": "Telugu",
  "ur": "Urdu",
  "brx": "Bodo",
  "sat": "Santali",
  "doi": "Dogri",
  "bh": "Maithili"
};

async function run() {
  console.log("Starting robust static locale generation...");
  
  for (const [code, lang] of Object.entries(targets)) {
    if (locales[code] && Object.keys(locales[code]).length > 20) {
      console.log(`Skipping ${lang}, already translated.`);
      continue;
    }
    
    console.log(`\nTranslating to ${lang}...`);
    const prompt = `You are a professional translator. Translate ONLY the values of this JSON from English to ${lang}. Keep the keys in English. Do not add markdown or explanation, just valid JSON.\n\nJSON:\n${JSON.stringify(en, null, 2)}`;
    
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
            fs.writeFileSync(file, JSON.stringify(locales, null, 2)); // Incremental save!
            console.log(`[SUCCESS] Saved ${lang} to locales.json!`);
        } else {
            console.log(`[FAILED] Regex parse failed for ${lang}`);
        }
    } catch (e) {
        console.error(`[ERROR] for ${lang}:`, e.message);
    }
  }
  console.log("Completed locale generation.");
}

run();
