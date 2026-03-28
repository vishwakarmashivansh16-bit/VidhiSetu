import fs from 'fs';
import path from 'path';

// Fetch from the free Google Translate Web API using batching
async function translateBatch(texts, targetLang) {
  if (!texts || texts.length === 0) return [];
  
  const delimiter = '\n\n||\n\n';
  const combined = texts.join(delimiter);
  
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(combined)}`;
  
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    
    const translatedText = data[0].map(x => x[0]).join('');
    return translatedText.split(/\n\n\|\|\n\n|\n\|\|\n/g).map(s => s.trim());
  } catch (error) {
    console.warn(`Translation failed in ${targetLang}`, error.message);
    return texts;
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

// Simple Regex to extract topic title, tag, description from topics.ts
async function runTopics() {
  console.log("Starting static topic summary generation (Batched)...");
  
  const topicsFile = path.join(process.cwd(), 'data', 'topics.ts');
  const content = fs.readFileSync(topicsFile, 'utf8');
  
  const topics = [];
  const regex = /id:\s*'([^']+)',\s*title:\s*'([^']+)',\s*category:\s*'([^']+)',\s*icon:[^,]+,\s*tag:\s*'([^']+)',\s*description:\s*'([^']+)'/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
      topics.push({
          id: match[1],
          title: match[2],
          tag: match[4],
          description: match[5]
      });
  }
  
  const newTopics = { en: {} };
  for (const t of topics) {
      newTopics.en[t.id] = t;
  }
  
  for (const code of Object.keys(targets)) {
    if (code === 'en') continue;
    
    console.log(`Translating topic summaries to ${targets[code]} (${code})...`);
    newTopics[code] = {};
    
    const textsToTranslate = [];
    topics.forEach(t => {
        textsToTranslate.push(t.title, t.tag, t.description);
    });
    
    // Batch into chunks of 15 strings
    const translatedFull = [];
    for (let i = 0; i < textsToTranslate.length; i += 15) {
      const batch = textsToTranslate.slice(i, i + 15);
      const translatedBatch = await translateBatch(batch, code);
      // In case of parsing mismatch, pad with original
      translatedFull.push(...translatedBatch.slice(0, batch.length));
      while(translatedFull.length < i + batch.length) {
          translatedFull.push(batch[translatedFull.length - i]);
      }
      await new Promise(r => setTimeout(r, 1000));
    }
    
    topics.forEach((t, i) => {
        const title = translatedFull[i*3] || t.title;
        const tag = translatedFull[i*3 + 1] || t.tag;
        const desc = translatedFull[i*3 + 2] || t.description;
        newTopics[code][t.id] = { id: t.id, title, tag, description: desc };
    });
  }
  
  fs.writeFileSync(path.join(process.cwd(), 'data', 'topics_all.json'), JSON.stringify(newTopics, null, 2));
  console.log("Saved data/topics_all.json successfully.");
}

runTopics().catch(console.error);
