import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Shield, FileText } from 'lucide-react';
import { useEffect, useState } from 'react';
import { translateText } from '../services/translationService';
import { getLanguageMeta, type LanguageCode } from '../languages';

interface LegalModalProps {
  type: 'privacy' | 'terms' | 'accessibility' | null;
  onClose: () => void;
  language: LanguageCode;
}

const content = {
  privacy: {
    icon: Shield,
    title: 'Privacy Policy',
    body: `VidhiSetu is committed to protecting your privacy.

Information We Collect
We collect only the information you voluntarily provide — such as your name and email when you submit a topic request or contact us. We do not collect any personally identifiable information passively.

How We Use It
Your information is used solely to respond to your queries and improve our legal content. We do not sell, trade, or share your data with third parties.

AI Interactions
Queries submitted to LawMitra (our AI assistant) are processed via the Google Gemini API. Please do not share sensitive personal details in chat messages.

Cookies
We use minimal, essential cookies only for session management. No tracking or advertising cookies are used.

Your Rights
You may request deletion of any data you have submitted by contacting us at privacy@vidhisetu.in.

Changes
We may update this policy periodically. Continued use of the platform constitutes acceptance of the updated policy.

Last updated: March 2026`
  },
  terms: {
    icon: FileText,
    title: 'Terms of Service',
    body: `By using VidhiSetu, you agree to the following terms.

Not Legal Advice
The content on VidhiSetu — including AI responses, topic guides, and legal summaries — is for informational and educational purposes only. It does not constitute legal advice and should not be relied upon as a substitute for consultation with a qualified legal professional.

Accuracy
While we strive for accuracy, laws change frequently. Always verify information with official government sources or a licensed advocate before taking legal action.

User Conduct
You agree not to misuse the platform, submit false information, or use the AI assistant for any unlawful purpose.

Intellectual Property
All content on VidhiSetu is the property of the VidhiSetu team. You may not reproduce or distribute it without written permission.

Limitation of Liability
VidhiSetu and its creators are not liable for any actions taken based on information provided on this platform.

Governing Law
These terms are governed by the laws of India. Any disputes shall be subject to the jurisdiction of courts in India.

Last updated: March 2026`
  },
  accessibility: {
    icon: Shield,
    title: 'Accessibility Statement',
    body: `VidhiSetu is committed to making legal knowledge accessible to everyone.

Our Commitment
We believe every citizen — regardless of ability, language, or literacy level — deserves access to legal information. We are continuously working to improve the accessibility of this platform.

Language Support
VidhiSetu currently supports English and Hindi, with plans to add more Indian languages including Tamil, Telugu, Bengali, and Marathi.

Design Principles
Our interface is designed with high contrast ratios, readable font sizes, and keyboard-navigable components to support users with visual or motor impairments.

AI Assistance
Our LawMitra AI assistant is designed to explain complex legal concepts in simple, plain language — making the law understandable for citizens without a legal background.

Feedback
If you encounter any accessibility barriers on our platform, please contact us at accessibility@vidhisetu.in. We take all feedback seriously and aim to respond within 5 business days.

Last updated: March 2026`
  }
};

export const LegalModal = ({ type, onClose, language }: LegalModalProps) => {
  if (!type) return null;
  const { icon: Icon, title, body } = content[type];

  const [translated, setTranslated] = useState<{ title: string; body: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (language === "en") {
        setTranslated({ title, body });
        return;
      }

      const cacheKey = `vidhisetu_legalModal_${type}_${language}`;
      try {
        const raw = localStorage.getItem(cacheKey);
        if (raw) {
          setTranslated(JSON.parse(raw));
          return;
        }
      } catch {
        // ignore
      }

      const meta = getLanguageMeta(language);
      const [tTitle, tBody] = await Promise.all([
        translateText(title, meta.promptName),
        translateText(body, meta.promptName),
      ]);

      const next = { title: tTitle, body: tBody };
      if (!cancelled) setTranslated(next);
      try {
        localStorage.setItem(cacheKey, JSON.stringify(next));
      } catch {
        // ignore
      }
    };

    run().catch(() => {
      // On translation failure, gracefully fall back to English.
      if (!cancelled) setTranslated({ title, body });
    });

    return () => {
      cancelled = true;
    };
  }, [language, type, title, body]);

  return (
    <AnimatePresence>
      {type && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg pointer-events-auto overflow-hidden flex flex-col max-h-[80vh]">
              <div className="bg-primary px-8 py-6 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <Icon className="text-white w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-bold text-white">{title}</h2>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-8 overflow-y-auto">
                <pre className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-sans">
                  {translated?.body ?? body}
                </pre>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
