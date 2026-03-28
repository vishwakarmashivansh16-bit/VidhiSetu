import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, ArrowLeft, ExternalLink, Scale, X } from 'lucide-react';
import { LegalTopic } from '../data/topics';
import { t as i18nT } from '../utils/i18n';
import { getLanguageMeta, type LanguageCode } from '../languages';
import topicsAll from '../data/topics_all.json';

export const TopicPage = ({
  topic,
  onBack,
  onAskAI,
  language,
}: {
  topic: LegalTopic;
  onBack: () => void;
  onAskAI: (title: string) => void;
  language: LanguageCode;
}) => {
  const Icon = topic.icon;
  const t = (key: string) => i18nT(language, key);

  const [translatedTopic, setTranslatedTopic] = useState<LegalTopic | null>(null);

  const effectiveTopic = translatedTopic ?? topic;

  useEffect(() => {
    if (language === "en") {
      setTranslatedTopic(topic);
      return;
    }

    const langTopics = (topicsAll as any)[language] || {};
    const translatedSummary = langTopics[topic.id];
    
    if (translatedSummary) {
      setTranslatedTopic({
        ...topic,
        title: translatedSummary.title,
        tag: translatedSummary.tag,
        description: translatedSummary.description,
      });
    } else {
      setTranslatedTopic(topic);
    }
  }, [language, topic]);

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="bg-slate-50 border-b border-slate-200 py-12">
        <div className="container-custom">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-text-muted hover:text-primary mb-8 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              {t('topic_back_all_topics')}
          </button>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-3xl">
              <div className="badge-accent mb-4">{effectiveTopic.tag}</div>
              <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4 leading-tight">
                {effectiveTopic.title}
              </h1>
              <p className="text-xl text-text-muted">
                {effectiveTopic.description}
              </p>
            </div>
            <div className="flex-shrink-0">
              <div className="w-24 h-24 bg-primary rounded-3xl flex items-center justify-center shadow-lg">
                <Icon className="text-white w-12 h-12" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container-custom py-16">
        <div className="grid lg:grid-cols-3 gap-16">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-16">
            {/* Definition */}
            <section className="legal-content-section">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Info className="text-blue-600 w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-primary !mt-0 !mb-0">{t('topic_what_is_this')}</h2>
              </div>
              <p>{effectiveTopic.fullContent.definition}</p>
            </section>

            {/* When it applies */}
            <section className="legal-content-section">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Scale className="text-amber-600 w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-primary !mt-0 !mb-0">{t('topic_when_does_it_apply')}</h2>
              </div>
              <p>
                {t('topic_when_apply_intro')}
              </p>
              <div className="grid sm:grid-cols-1 gap-4 mt-8">
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
                  <ul className="space-y-4 text-sm text-text-muted list-none !ml-0">
                    {effectiveTopic.fullContent.applicability.map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-base text-slate-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            {/* Key Steps */}
            <section className="legal-content-section">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Icon className="text-green-600 w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-primary !mt-0 !mb-0">{t('topic_key_steps_to_take')}</h2>
              </div>
              <div className="space-y-8 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {effectiveTopic.fullContent.steps.map((step, i) => (
                  <div key={i} className="relative pl-12">
                    <div className="absolute left-0 top-0 w-10 h-10 bg-white border-2 border-primary rounded-full flex items-center justify-center font-bold text-primary z-10">{i + 1}</div>
                    <h3 className="text-xl font-bold text-primary mb-2">{step.title}</h3>
                    <p className="text-text-muted">{step.description}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Misconceptions */}
            <section className="legal-content-section">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="text-red-600 w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-primary !mt-0 !mb-0">{t('topic_common_misconceptions')}</h2>
              </div>
              <div className="space-y-4">
                {effectiveTopic.fullContent.misconceptions.map((m, i) => (
                  <div key={i} className="flex gap-4 p-5 bg-red-50/50 rounded-2xl border border-red-100">
                    <X className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-bold text-red-900 mb-1">"{m.myth}"</h4>
                      <p className="text-sm text-red-800/80"><strong>{t('topic_fact_label')}:</strong> {m.fact}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <div className="card-legal p-8 bg-primary text-white sticky top-24">
              <h3 className="text-xl font-bold mb-4">{t('topic_need_legal_help_title')}</h3>
              <p className="text-slate-300 mb-6 text-sm leading-relaxed">
                {t('topic_need_legal_help_body')}
              </p>
              <button 
                onClick={() => onAskAI(topic.title)}
                className="w-full bg-accent text-white font-bold py-3 rounded-xl hover:bg-accent/90 transition-colors flex items-center justify-center gap-2"
              >
                {t('topic_simplify_with_ai')}
                <Scale className="w-4 h-4" />
              </button>
              <p className="text-[10px] text-slate-400 mt-6 text-center uppercase tracking-widest font-semibold">
                {t('topic_emergency_hotline')}
              </p>
            </div>

            <div className="card-legal p-8">
              <h3 className="text-lg font-bold text-primary mb-4">{t('topic_related_resources')}</h3>
              <div className="space-y-4">
                {effectiveTopic.fullContent.resources.map((res, i) => (
                  <React.Fragment key={i}>
                    <a href={res.link} className="flex items-center justify-between group">
                      <span className="text-sm text-text-muted group-hover:text-primary transition-colors">{res.title}</span>
                      <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors" />
                    </a>
                    {i < effectiveTopic.fullContent.resources.length - 1 && (
                      <div className="h-px bg-slate-100" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

