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
    
    // Sometimes Google parses \n\n into multiple segments
    const translatedText = data[0].map(x => x[0]).join('');
    // Split back by delimiter (handle extra spaces injected by translate)
    return translatedText.split(/\n[\s]*\n[\s]*\|\|[\s]*\n[\s]*\n|\n[\s]*\|\|[\s]*\n/g).map(s => s.trim());
  } catch (error) {
    console.warn(`Translation failed in ${targetLang}`, error.message);
    return texts;
  }
}

const remainingTargets = {
  "as": "Assamese",
  "ks": "Kashmiri",
  "kok": "Konkani",
  "ml": "Malayalam",
  "mni": "Manipuri",
  "ne": "Nepali",
  "or": "Odia",
  "pa": "Punjabi",
  "sa": "Sanskrit",
  "sd": "Sindhi",
  "ur": "Urdu",
  "brx": "Bodo",
  "sat": "Santali",
  "doi": "Dogri",
  "bh": "Maithili"
};

async function runAll() {
  console.log("Starting static locale and topic generation for 15 remaining languages...");
  
  const localesAllPath = path.join(process.cwd(), 'data', 'locales_all.json');
  const topicsAllPath = path.join(process.cwd(), 'data', 'topics_all.json');
  const topicsDefinitionsPath = path.join(process.cwd(), 'data', 'topics.ts');
  
  const localesAll = JSON.parse(fs.readFileSync(localesAllPath, 'utf8'));
  const enLocale = localesAll.en;
  
  const topicsAll = JSON.parse(fs.readFileSync(topicsAllPath, 'utf8'));
  
  // Extract topics EN
  const content = fs.readFileSync(topicsDefinitionsPath, 'utf8');
  const topicsList = [];
  const regex = /id:\s*'([^']+)',\s*title:\s*'([^']+)',\s*category:\s*'([^']+)',\s*icon:[^,]+,\s*tag:\s*'([^']+)',\s*description:\s*'([^']+)'/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
      topicsList.push({ id: match[1], title: match[2], tag: match[4], description: match[5] });
  }
  
  for (const code of Object.keys(remainingTargets)) {
    if (localesAll[code] && Object.keys(localesAll[code]).length > 10 && topicsAll[code]) {
        console.log(`Skipping ${remainingTargets[code]}, already processed.`);
        continue;
    }
    
    console.log(`Processing ${remainingTargets[code]} (${code})...`);
    
    // TRANSLATE LOCALES
    localesAll[code] = {};
    const entries = Object.entries(enLocale);
    for (let i = 0; i < entries.length; i += 15) {
      const batch = entries.slice(i, i + 15);
      const translatedBatch = await translateBatch(batch.map(e => e[1]), code);
      for (let j = 0; j < batch.length; j++) {
        // Fallback robustly
        const trans = translatedBatch[j] || batch[j][1];
        // Restore variable templates messed up by google translate
        localesAll[code][batch[j][0]] = trans.replace(/\{\s?count\s?\}/ig, '{count}').replace(/\{\s?bns\s?\}/ig, '{bns}').replace(/\{\s?ipc\s?\}/ig, '{ipc}');
      }
      await new Promise(r => setTimeout(r, 1000));
    }
    
    // TRANSLATE TOPICS
    topicsAll[code] = {};
    const topicTexts = [];
    topicsList.forEach(t => topicTexts.push(t.title, t.tag, t.description));
    
    const translatedTopicTexts = [];
    for (let i = 0; i < topicTexts.length; i += 15) {
      const batch = topicTexts.slice(i, i + 15);
      const translatedBatch = await translateBatch(batch, code);
      translatedTopicTexts.push(...translatedBatch.slice(0, batch.length));
      while(translatedTopicTexts.length < i + batch.length) {
          translatedTopicTexts.push(batch[translatedTopicTexts.length - i]);
      }
      await new Promise(r => setTimeout(r, 500));
    }
    
    topicsList.forEach((t, i) => {
        topicsAll[code][t.id] = {
            id: t.id,
            title: translatedTopicTexts[i*3] || t.title,
            tag: translatedTopicTexts[i*3 + 1] || t.tag,
            description: translatedTopicTexts[i*3 + 2] || t.description
        };
    });
    
    // Save incrementally
    fs.writeFileSync(localesAllPath, JSON.stringify(localesAll, null, 2));
    fs.writeFileSync(topicsAllPath, JSON.stringify(topicsAll, null, 2));
    console.log(`Finished and saved for ${remainingTargets[code]}`);
  }
}

runAll().catch(console.error);
