import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, BookOpen, Scale, ShieldCheck, Gavel, FileText, ChevronRight } from 'lucide-react';
import legalDb from '../data/legalDb.json';
import { t as i18nT } from '../utils/i18n';
import { getLanguageMeta, type LanguageCode } from '../languages';
import { translateLegalDbCategory } from '../services/translationService';

interface CommonLawsPageProps {
  onBack: () => void;
  language: LanguageCode;
}

export const CommonLawsPage = ({ onBack, language }: CommonLawsPageProps) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [translatedCategoryById, setTranslatedCategoryById] = useState<
    Record<string, (typeof legalDb.categories)[number]>
  >({});

  const t = (key: string, params?: Record<string, any>) =>
    i18nT(language as LanguageCode, key, params);

  const baseSelectedCategory = legalDb.categories.find(cat => cat.id === selectedCategoryId);
  const selectedCategory = baseSelectedCategory
    ? (translatedCategoryById[baseSelectedCategory.id] ?? baseSelectedCategory)
    : undefined;

  const categoriesToRender = useMemo(() => {
    return legalDb.categories.map(cat => translatedCategoryById[cat.id] ?? cat);
  }, [translatedCategoryById]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (language === "en") {
        setTranslatedCategoryById({});
        return;
      }

      const meta = getLanguageMeta(language);
      const nextById: Record<string, (typeof legalDb.categories)[number]> = {};

      for (const cat of legalDb.categories) {
        const cacheKey = `nyaymitra_category_${cat.id}_${language}`;
        try {
          const raw = localStorage.getItem(cacheKey);
          if (raw) {
            nextById[cat.id] = JSON.parse(raw) as (typeof legalDb.categories)[number];
            continue;
          }
        } catch {
          // ignore cache errors
        }

        const translated = await translateLegalDbCategory(cat, meta.promptName);
        if (cancelled) return;
        nextById[cat.id] = translated;
        try {
          localStorage.setItem(cacheKey, JSON.stringify(translated));
        } catch {
          // ignore
        }
      }

      if (!cancelled) setTranslatedCategoryById(nextById);
    };

    run().catch(() => {
      if (!cancelled) setTranslatedCategoryById({});
    });

    return () => {
      cancelled = true;
    };
  }, [language]);

  const handleBack = () => {
    if (selectedCategoryId) {
      setSelectedCategoryId(null);
    } else {
      onBack();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container-custom">
        <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <button 
              onClick={handleBack}
              className="flex items-center gap-2 text-primary font-bold hover:text-accent transition-colors mb-4"
            >
              <ArrowLeft className="w-5 h-5" />
              {selectedCategoryId ? t('common_back_to_categories') : t('back')}
            </button>
            <div className="flex items-center gap-4">
              <div className="bg-primary p-3 rounded-2xl shadow-lg">
                <BookOpen className="text-white w-8 h-8" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-primary">
                  {selectedCategory ? selectedCategory.name : t('cat_common_laws_title')}
                </h1>
                <p className="text-text-muted mt-1">
                  {selectedCategory ? selectedCategory.description : t('cat_common_laws_desc')}
                </p>
              </div>
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {!selectedCategoryId ? (
            <motion.div 
              key="categories"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {categoriesToRender.map((category, i) => (
                <motion.div 
                  key={category.id}
                  whileHover={{ scale: 1.02 }}
                  className="card-legal p-8 bg-white border border-slate-200 hover:border-primary cursor-pointer group"
                  onClick={() => setSelectedCategoryId(category.id)}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center group-hover:bg-primary transition-colors">
                      <FileText className="w-6 h-6 text-primary group-hover:text-white transition-colors" />
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary transition-colors" />
                  </div>
                  <h3 className="text-2xl font-bold text-primary mb-4">{category.name}</h3>
                  <p className="text-sm text-text-muted leading-relaxed">
                    {category.description}
                  </p>
                  <div className="mt-6 flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
                    {t('common_view_crimes', { count: category.crimes.length })}
                    <ArrowLeft className="w-3 h-3 rotate-180" />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              key="crimes"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {selectedCategory?.crimes.map((crime, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="card-legal p-8 bg-white border border-slate-200 hover:border-primary transition-all group"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center group-hover:bg-primary transition-colors">
                      <Scale className="w-6 h-6 text-primary group-hover:text-white transition-colors" />
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-2 py-1 rounded">
                        {t('common_bns_label', { bns: crime.bns })}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted bg-slate-100 px-2 py-1 rounded">
                        {t('common_ipc_label', { ipc: crime.ipc_ref })}
                      </span>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-primary mb-4">{crime.crime}</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-widest text-text-muted mb-1">{t('common_punishment_heading')}</h4>
                      <p className="text-sm text-slate-700 leading-relaxed">{crime.punishment}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-16 p-8 bg-primary/5 rounded-3xl border border-primary/10 flex flex-col md:flex-row items-center gap-8">
          <div className="bg-primary p-4 rounded-2xl">
            <ShieldCheck className="text-white w-10 h-10" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-primary mb-2">{t('common_need_more_details_title')}</h3>
            <p className="text-text-muted">
              {t('common_need_more_details_body')}
            </p>
          </div>
          <button 
            onClick={onBack}
            className="md:ml-auto bg-primary text-white px-8 py-3 rounded-full font-bold hover:bg-accent transition-colors whitespace-nowrap"
          >
            {t('common_ask_lawmmitra')}
          </button>
        </div>
      </div>
    </div>
  );
};
