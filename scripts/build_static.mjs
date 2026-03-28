import fs from 'fs';
import path from 'path';

// Fetch from the free Google Translate Web API using batching
async function translateBatch(texts, targetLang) {
  if (!texts || texts.length === 0) return [];
  
  // Combine with a unique delimiter that Google Translate usually preserves
  const delimiter = '\n\n|||\n\n';
  const combined = texts.join(delimiter);
  
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(combined)}`;
  
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    
    // Combine the translated chunks
    const translatedText = data[0].map(x => x[0]).join('');
    // Split back by delimiter
    return translatedText.split(/\n\n\|\|\|\n\n|\n\|\|\|\n/g).map(s => s.trim());
  } catch (error) {
    console.warn(`Translation failed in ${targetLang}`, error.message);
    return texts; // Fallback to original
  }
}

const targets = {
  "en": "English",
  "hi": "Hindi",
  "mr": "Marathi",
  "gu": "Gujarati",
  "bn": "Bengali",
  "ta": "Tamil",
  "te": "Telugu"
};

async function runLocales() {
  console.log("Starting static locale generation (Batched)...");
  
  const localesFile = path.join(process.cwd(), 'data', 'locales.json');
  const locales = JSON.parse(fs.readFileSync(localesFile, 'utf8'));
  const enLocale = locales.en;
  
  const newLocales = { en: enLocale };
  
  for (const code of Object.keys(targets)) {
    if (code === 'en') continue;
    
    console.log(`Translating locales to ${targets[code]} (${code})...`);
    newLocales[code] = {};
    
    const entries = Object.entries(enLocale);
    
    // Process in batches of 15 strings
    for (let i = 0; i < entries.length; i += 15) {
      const batch = entries.slice(i, i + 15);
      const textsToTranslate = batch.map(e => e[1]);
      
      const translatedBatch = await translateBatch(textsToTranslate, code);
      
      for (let j = 0; j < batch.length; j++) {
        const key = batch[j][0];
        // Safely map translated string or fallback
        const trans = translatedBatch[j] || batch[j][1];
        newLocales[code][key] = trans.replace(/\{ count \}/g, '{count}').replace(/\{bns\}/g, '{bns}').replace(/\{ipc\}/g, '{ipc}');
      }
      
      await new Promise(r => setTimeout(r, 1000)); // 1 sec delay to prevent bans
    }
  }
  
  fs.writeFileSync(path.join(process.cwd(), 'data', 'locales_all.json'), JSON.stringify(newLocales, null, 2));
  console.log("Saved data/locales_all.json successfully.");
}

runLocales().catch(console.error);
