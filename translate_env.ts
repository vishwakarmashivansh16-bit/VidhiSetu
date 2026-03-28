import fs from "fs";
import { GoogleGenAI } from "@google/genai";
import { SUPPORTED_LANGUAGES as languages } from "./languages";

const ai = new GoogleGenAI({ apiKey: "AIzaSyAQYr8Dhy74aaUzSUZ4jm6HGzCRVHPq4GQ" });

const uiStrings = {
  oe_back: "Back to Home",
  oe_pro: "Pro Feature",
  oe_title: "Dynamic Case Analyzer",
  oe_subtitle: "Submit complex imaginary or real scenarios. VidhiSetu AI will automatically map multiple overlapping crimes, BNS sections, and exact severity.",
  oe_label: "Case Facts / FIR Scenario",
  oe_placeholder: "E.g. A murder triggers a massive property dispute where forged land accusation documents were previously fired at the victim...",
  oe_try: "Try an Example",
  oe_ex1: "Murder & Property Dispute",
  oe_ex2: "Corporate Bank Embezzlement",
  oe_run: "Run Deep Analysis",
  oe_analyzing: "Analyzing Statutes...",
  oe_awaiting: "Awaiting Case Details",
  oe_awaiting_sub: "Enter a complex legal scenario on the left to instantly map overlapping crimes and assess baseline severity.",
  oe_matrix: "Complexity Matrix",
  oe_severity: "Severity",
  oe_out_of: "out of 10.0",
  oe_crimes: "Crimes Identified",
  oe_bns: "BNS Statutes",
  oe_factors: "Aggravating Factors Context",
  oe_assessment: "Strategic Assessment"
};

async function run() {
  const filePath = "data/locales_all.json";
  let bundle = {};
  if (fs.existsSync(filePath)) {
    bundle = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  }

  // Ensure 'en' is baseline
  bundle["en"] = { ...(bundle["en"] || {}), ...uiStrings };

  for (const lang of languages) {
    if (lang.code === "en") continue;
    if (bundle[lang.code]?.oe_title) continue; // Skip if already translated

    console.log(`Translating for ${lang.promptName}...`);
    try {
      const prompt = `Translate this JSON object into ${lang.promptName}. Maintain the exact JSON keys. Return only raw JSON.\n\n${JSON.stringify(uiStrings, null, 2)}`;
      
      const res = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
        config: { temperature: 0.1, responseMimeType: "application/json" }
      });
      
      const parsed = JSON.parse(res.text || "{}");
      bundle[lang.code] = { ...(bundle[lang.code] || {}), ...parsed };

      // Save progressively
      fs.writeFileSync(filePath, JSON.stringify(bundle, null, 2), "utf-8");
      
      console.log(`Success! Waiting 4s to respect rate limits...`);
      await new Promise(r => setTimeout(r, 4000));
    } catch (err) {
      console.warn(`Skipped ${lang.promptName} due to API rate limit/error.`);
    }
  }
  console.log("Translation complete!");
}

run();
