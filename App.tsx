import React, { useEffect, useMemo, useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { CategoryCard } from './components/CategoryCard';
import { TopicPage } from './components/TopicPage';
import { Footer } from './components/Footer';
import { LegalAssistant } from './components/LegalAssistant';
import { LawMitraPage } from './components/LawMitraPage';
import { CommonLawsPage } from './components/CommonLawsPage';
import { Scale, BookOpen, FileText, HelpCircle, Search as SearchIcon, ArrowRight, Bot, Loader2, AlertTriangle, BrainCircuit, RefreshCw } from 'lucide-react';
import { ContactModal } from './components/ContactModal';
import { TopicRequestModal } from './components/TopicRequestModal';
import { motion, AnimatePresence } from 'motion/react';
import { topics, LegalTopic } from './data/topics';
import { ensureLanguageLoaded, t as i18nT } from './utils/i18n';
import { OpenEnvSimulator } from './components/OpenEnvSimulator';
import { getLanguageMeta, type LanguageCode } from './languages';
import topicsAll from './data/topics_all.json';
import { solve, type LegalAnswer } from './services/legalService';

const App = () => {
  const [view, setView] = useState<'home' | 'topic' | 'search' | 'lawmitra' | 'common-laws' | 'openenv'>('home');
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [shuffleTrigger, setShuffleTrigger] = useState(0);

  const shuffledTopics = useMemo(() => 
    [...topics].sort(() => Math.random() - 0.5), 
  [shuffleTrigger]);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [assistantInitialMessage, setAssistantInitialMessage] = useState<string | undefined>(undefined);
  const [language, setLanguage] = useState<LanguageCode>(() => {
    try {
      const saved = localStorage.getItem("nyaymitra_lang");
      if (saved) return saved as LanguageCode;
    } catch {
      // ignore
    }
    return "en";
  });
  const [i18nVersion, setI18nVersion] = useState(0);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isTopicRequestOpen, setIsTopicRequestOpen] = useState(false);

  const [translatedTopicSummaries, setTranslatedTopicSummaries] = useState<
    Record<string, { title: string; tag: string; description: string }>
  >({});
  const [isTopicSummariesLoading, setIsTopicSummariesLoading] = useState(false);

  const t = (key: string, params?: Record<string, any>) =>
    i18nT(language, key, params);

  useEffect(() => {
    ensureLanguageLoaded(language)
      .then(() => setI18nVersion(v => v + 1))
      .catch((err) => {
        // Translation failures shouldn't break the app, but we log for debugging.
        console.error("i18n load failed:", err);
      });
    try {
      localStorage.setItem("nyaymitra_lang", language);
    } catch {
      // ignore
    }
  }, [language]);

  useEffect(() => {
    setIsTopicSummariesLoading(false); // No loading time needed
    if (language === "en") {
      setTranslatedTopicSummaries({});
      return;
    }

    const langTopics = (topicsAll as any)[language] || {};
    const next: Record<string, { title: string; tag: string; description: string }> = {};

    for (const topic of topics) {
      if (langTopics[topic.id]) {
        next[topic.id] = langTopics[topic.id];
      } else {
        next[topic.id] = { title: topic.title, tag: topic.tag, description: topic.description };
      }
    }

    setTranslatedTopicSummaries(next);
  }, [language]);

  const handleAskAI = (topicTitle: string) => {
    setAssistantInitialMessage(`Can you explain the key concepts of "${topicTitle}" in very simple terms?`);
    setIsAssistantOpen(true);
  };

  const categories = [
    {
      title: t('cat_lawmitra_title'),
      description: t('cat_lawmitra_desc'),
      icon: Bot,
      color: 'bg-blue-100 text-blue-600',
      view: 'lawmitra' as const,
    },
    {
      title: t('cat_common_laws_title'),
      description: t('cat_common_laws_desc'),
      icon: BookOpen,
      color: 'bg-amber-100 text-amber-600',
      view: 'common-laws' as const,
    },
  ];

  const filteredTopics = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return topics.filter(t => {
      const summary = translatedTopicSummaries[t.id];
      const title = (summary?.title ?? t.title).toLowerCase();
      const description = (summary?.description ?? t.description).toLowerCase();
      const tag = (summary?.tag ?? t.tag).toLowerCase();
      return title.includes(query) || description.includes(query) || tag.includes(query);
    });
  }, [searchQuery, translatedTopicSummaries]);

  const handleTopicClick = (id: string) => {
    setSelectedTopicId(id);
    setView('topic');
    window.scrollTo(0, 0);
  };

  const selectedTopic = topics.find(t => t.id === selectedTopicId);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery}
        onLogoClick={() => {
          setView('home');
          setSearchQuery('');
        }}
        language={language}
        setLanguage={setLanguage}
        setView={setView}
      />
      
      <main className="flex-grow">
          {view === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.15 }}
            >
              <Hero 
                language={language}
                onExplore={() => {
                  const element = document.getElementById('categories');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }} 
              />
              
              {/* Categories Section */}
              <section id="categories" className="py-24 bg-white">
                <div className="container-custom">
                  <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('cat_title')}</h2>
                    <p className="text-lg text-text-muted">
                      {t('cat_sub')}
                    </p>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {categories.map((cat, i) => (
                      <CategoryCard 
                        key={i} 
                        title={cat.title}
                        description={cat.description}
                        icon={cat.icon}
                        color={cat.color}
                        onClick={() => {
                          setView(cat.view);
                        }}
                      />
                    ))}
                  </div>
                </div>
              </section>

              {/* Featured Topics */}
              <section className="py-24 bg-slate-50 border-y border-slate-200">
                <div className="container-custom">
                  <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
                    <div className="max-w-2xl">
                      <h2 className="text-3xl font-bold mb-4">{t('featured_title')}</h2>
                      <p className="text-text-muted">
                        {t('featured_sub')}
                      </p>
                    </div>
                    <div className="flex items-center gap-6">
                      <button 
                        onClick={() => setShuffleTrigger(prev => prev + 1)}
                        className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-widest hover:text-accent transition-colors"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Shuffle
                      </button>
                      <button 
                        onClick={() => {
                          setView('search');
                          setSearchQuery('');
                        }}
                        className="text-primary font-bold text-sm uppercase tracking-widest hover:text-accent transition-colors"
                      >
                        {t('view_all')}
                      </button>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-8">
                    {shuffledTopics.slice(0, 3).map((topic) => {
                      const summary = translatedTopicSummaries[topic.id];
                      return (
                        <motion.div 
                          key={topic.id}
                          whileHover={{ scale: 1.02 }}
                          className="card-legal p-8 bg-white cursor-pointer group"
                          onClick={() => handleTopicClick(topic.id)}
                        >
                          <div className="flex justify-between items-start mb-6">
                            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                              <topic.icon className="w-6 h-6 text-primary" />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted bg-slate-100 px-2 py-1 rounded">
                              {summary?.tag ?? topic.tag}
                            </span>
                          </div>
                          <h3 className="text-xl font-bold text-primary mb-4 group-hover:text-accent transition-colors">
                            {summary?.title ?? topic.title}
                          </h3>
                          <p className="text-sm text-text-muted mb-6 line-clamp-2">
                            {summary?.description ?? topic.description}
                          </p>
                          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
                            {t('read_full')}
                            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </section>

              {/* OpenEnv Card */}
              <section className="py-12 bg-white">
                <div className="container-custom">
                  <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-2xl group cursor-pointer"
                       onClick={() => setView('openenv')}>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/30 rounded-full filter blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <BrainCircuit className="w-5 h-5 text-green-400" />
                          <span className="text-green-400 font-bold tracking-widest uppercase text-[10px]">New Interactive Feature</span>
                        </div>
                        <h3 className="text-3xl font-bold text-white mb-2">OpenEnv AI Simulator</h3>
                        <p className="text-slate-300 max-w-2xl">Test your legal deductions against the strict HuggingFace AI evaluation criteria. Solve the 3 benchmark FIR scenarios and score a perfect 1.0!</p>
                      </div>
                      <button className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-8 py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 group-hover:bg-primary group-hover:border-primary shrink-0">
                        Launch Training Mode <ArrowRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              {/* Call to Action */}
              <section className="py-24 bg-white">
                <div className="container-custom">
                  <div className="bg-primary rounded-[2rem] p-12 md:p-20 text-center text-white relative overflow-hidden">
                    <div className="relative z-10 max-w-3xl mx-auto">
                      <h2 className="text-4xl md:text-5xl font-bold mb-8 text-white">
                        {t('cta_title')}
                      </h2>
                      <p className="text-xl text-slate-300 mb-10 leading-relaxed">
                        {t('cta_sub')}
                      </p>
                      <div className="flex flex-wrap justify-center gap-4">
                        <button className="bg-white text-primary px-8 py-4 rounded-full font-bold hover:bg-slate-100 transition-colors" onClick={() => setIsTopicRequestOpen(true)}>
                          {t('cta_submit')}
                        </button>
                        <button className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-full font-bold hover:bg-white/10 transition-colors" onClick={() => setIsContactOpen(true)}>
                          {t('cta_contact')}
                        </button>
                      </div>
                    </div>
                    {/* Decorative background icon */}
                    <Scale className="absolute -bottom-20 -right-20 w-96 h-96 text-white/5 -rotate-12" />
                  </div>
                </div>
              </section>
            </motion.div>
          )}

          {view === 'search' && (
            <motion.div
              key="search"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15 }}
              className="py-16 bg-white min-h-[60vh]"
            >
              <div className="container-custom">
                <div className="mb-12">
                  <h2 className="text-3xl font-bold text-primary mb-2">
                    {searchQuery ? `${t('search_results')} "${searchQuery}"` : t('all_topics')}
                  </h2>
                  <p className="text-text-muted">
                    {searchQuery ? t('found_topics', { count: filteredTopics.length }) : t('showing_all', { count: topics.length })}
                  </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {(searchQuery ? filteredTopics : topics).map((topic) => {
                    const summary = translatedTopicSummaries[topic.id];
                    return (
                      <motion.div 
                        key={topic.id}
                        whileHover={{ scale: 1.02 }}
                        className="card-legal p-8 bg-slate-50 border border-slate-200 cursor-pointer group"
                        onClick={() => handleTopicClick(topic.id)}
                      >
                        <div className="flex justify-between items-start mb-6">
                          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                            <topic.icon className="w-6 h-6 text-primary" />
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted bg-white px-2 py-1 rounded border border-slate-200">
                            {summary?.tag ?? topic.tag}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-primary mb-4 group-hover:text-accent transition-colors">
                          {summary?.title ?? topic.title}
                        </h3>
                        <p className="text-sm text-text-muted mb-6">
                          {summary?.description ?? topic.description}
                        </p>
                        <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
                          {t('read_full')}
                          <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {(searchQuery && filteredTopics.length === 0 && !isTopicSummariesLoading) && (
                  <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                    <SearchIcon className="w-16 h-16 text-slate-300 mx-auto mb-6" />
                    <h3 className="text-2xl font-bold text-primary mb-2">{t('no_results')}</h3>
                    <p className="text-text-muted mb-8">{t('no_results_sub')}</p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                      <button 
                        onClick={() => {
                          setAssistantInitialMessage(`Can you explain the legal aspects regarding "${searchQuery}" in simple terms?`);
                          setIsAssistantOpen(true);
                        }}
                        className="bg-accent text-white px-8 py-3 rounded-full font-bold hover:bg-accent/90 transition-colors flex items-center justify-center gap-2"
                      >
                        <Bot className="w-5 h-5" />
                        Ask AI about "{searchQuery}"
                      </button>
                      <button 
                        onClick={() => setSearchQuery('')}
                        className="bg-slate-200 text-primary px-8 py-3 rounded-full font-bold hover:bg-slate-300 transition-colors"
                      >
                        {t('clear_search')}
                      </button>
                    </div>
                  </div>
                )}

                {(searchQuery && filteredTopics.length === 0 && isTopicSummariesLoading) && (
                  <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                    <h3 className="text-2xl font-bold text-primary mb-2">{t('search_results')}</h3>
                    <p className="text-text-muted mb-8">{t('searching_please_wait')}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {view === 'lawmitra' && (
            <motion.div
              key="lawmitra"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <LawMitraPage 
                language={language}
                onBack={() => setView('home')}
              />
            </motion.div>
          )}

          {view === 'common-laws' && (
            <motion.div
              key="common-laws"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <CommonLawsPage 
                language={language}
                onBack={() => setView('home')}
              />
            </motion.div>
          )}

          {view === 'topic' && selectedTopic && (
            <motion.div
              key="topic"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.15 }}
            >
              <TopicPage 
                topic={selectedTopic} 
                language={language}
                onBack={() => {
                  if (searchQuery) setView('search');
                  else setView('home');
                }} 
                onAskAI={handleAskAI}
              />
            </motion.div>
          )}

          {view === 'openenv' && (
            <motion.div
              key="openenv"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.15 }}
            >
              <OpenEnvSimulator 
                language={language}
                onBack={() => setView('home')} 
                openAssistant={(msg) => {
                  setAssistantInitialMessage(msg);
                  setIsAssistantOpen(true);
                }} 
              />
            </motion.div>
          )}
      </main>

      <Footer
        setView={setView}
        onContactClick={() => setIsContactOpen(true)}
        language={language}
      />
      <LegalAssistant 
        isOpen={isAssistantOpen} 
        setIsOpen={setIsAssistantOpen} 
        initialMessage={assistantInitialMessage}
        language={language}
      />
      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
        language={language}
      />
      <TopicRequestModal
        isOpen={isTopicRequestOpen}
        onClose={() => setIsTopicRequestOpen(false)}
        language={language}
      />
    </div>
  );
};

export default App;
