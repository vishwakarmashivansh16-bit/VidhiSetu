import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, ShieldCheck, Scale, Gavel, FileText } from 'lucide-react';
import { t as i18nT } from '../utils/i18n';
import DottedGlowBackground from './DottedGlowBackground';
import type { LanguageCode } from '../languages';

interface HeroProps {
  onExplore: () => void;
  language?: string;
}

export const Hero = ({ onExplore, language = 'en' }: HeroProps) => {
  const t = (key: string) => i18nT(language as LanguageCode, key);

  return (
    <section className="relative py-20 lg:py-32 overflow-hidden hero-gradient">
      <DottedGlowBackground
        className="pointer-events-none"
        color="rgba(30,41,59,0.08)"
        glowColor="rgba(217,119,6,0.4)"
        gap={28}
        radius={1.5}
        speedScale={0.4}
      />
      <div className="container-custom relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-semibold mb-6">
              <ShieldCheck className="w-4 h-4" />
              {t('hero_badge')}
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold leading-tight mb-6 text-primary">
              {t('hero_title').split(' — ')[0]} <br />
              <span className="text-accent italic">{t('hero_title').split(' — ')[1] || 'Simplified'}</span>
            </h1>
            <p className="text-xl text-text-muted mb-10 leading-relaxed">
              {t('hero_sub')}
            </p>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={onExplore}
                className="btn-primary"
              >
                {t('hero_explore')}
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="relative z-10 grid grid-cols-2 gap-6">
              <div className="space-y-6 pt-12">
                <div className="card-legal p-8 bg-white/40 backdrop-blur-sm transform hover:-translate-y-2 transition-transform duration-500">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                    <Scale className="text-blue-600 w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{t('hero_card_faq_title')}</h3>
                  <p className="text-sm text-text-muted">{t('hero_card_faq_desc')}</p>
                </div>
                <div className="card-legal p-8 bg-white/40 backdrop-blur-sm transform hover:-translate-y-2 transition-transform duration-500">
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
                    <Gavel className="text-amber-600 w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{t('hero_card_laws_title')}</h3>
                  <p className="text-sm text-text-muted">{t('hero_card_laws_desc')}</p>
                </div>
              </div>
              <div className="space-y-6">
                <div className="card-legal p-8 bg-white/40 backdrop-blur-sm transform hover:-translate-y-2 transition-transform duration-500">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                    <ShieldCheck className="text-green-600 w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{t('hero_card_rights_title')}</h3>
                  <p className="text-sm text-text-muted">{t('hero_card_rights_desc')}</p>
                </div>
                <div className="card-legal p-8 bg-white/40 backdrop-blur-sm transform hover:-translate-y-2 transition-transform duration-500">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                    <FileText className="text-purple-600 w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{t('hero_card_glossary_title')}</h3>
                  <p className="text-sm text-text-muted">{t('hero_card_glossary_desc')}</p>
                </div>
              </div>
            </div>
            {/* Decorative elements */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-accent/5 rounded-full blur-3xl -z-10" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};
