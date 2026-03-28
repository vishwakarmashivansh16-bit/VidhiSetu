import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BrainCircuit, Loader2, ArrowLeft, ShieldAlert, Scale, Crosshair, AlertTriangle, FileWarning, Search as SearchIcon } from 'lucide-react';
import { evaluateCaseComplexity, type CaseComplexityResult } from '../services/legalService';
import { t } from '../utils/i18n';
import type { LanguageCode } from '../languages';

export const OpenEnvSimulator = ({ language, onBack, openAssistant }: { language: LanguageCode, onBack: () => void, openAssistant: (msg: string) => void }) => {
  const [scenario, setScenario] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<CaseComplexityResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!scenario.trim()) return;
    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const data = await evaluateCaseComplexity(scenario);
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Failed to analyze the scenario.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const loadExample = (text: string) => {
    setScenario(text);
  };

  return (
    <div className="min-h-[80vh] bg-slate-50 pt-16 pb-12">
      <div className="max-w-5xl mx-auto px-4">
        
        {/* Header */}
        <div className="mb-8">
          <button onClick={onBack} className="flex items-center gap-2 text-text-muted hover:text-primary transition-colors font-bold mb-6">
            <ArrowLeft className="w-5 h-5" />
            {t(language, 'oe_back')}
          </button>
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-primary p-4 rounded-2xl text-white shadow-lg relative overflow-hidden">
              <BrainCircuit className="w-8 h-8 relative z-10" />
              <div className="absolute inset-0 bg-accent/20 animate-pulse"></div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full">{t(language, 'oe_pro')}</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight">{t(language, 'oe_title')}</h1>
              <p className="text-slate-500 font-medium mt-1">{t(language, 'oe_subtitle')}</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          
          {/* Left Column: Input Panel */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-200">
              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">{t(language, 'oe_label')}</label>
              <textarea
                value={scenario}
                onChange={(e) => setScenario(e.target.value)}
                placeholder={t(language, 'oe_placeholder')}
                className="w-full h-48 bg-slate-50 border border-slate-200 rounded-2xl p-4 focus:ring-2 focus:ring-primary focus:border-primary transition-all text-slate-700 placeholder-slate-400 resize-none font-medium leading-relaxed"
              />
              
              <div className="mt-4 mb-6">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">{t(language, 'oe_try')}</p>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => loadExample("A murder is involved in a property dispute, which property was already under land acquisition charges. The victim was poisoned during a court hearing.")} className="text-xs bg-slate-100 text-slate-600 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors text-left">
                    {t(language, 'oe_ex1')}
                  </button>
                  <button onClick={() => loadExample("A bank manager steals ₹50 Lakhs by forging customer signatures over 3 years, transferring it to hidden crypto accounts.")} className="text-xs bg-slate-100 text-slate-600 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors text-left">
                    {t(language, 'oe_ex2')}
                  </button>
                  <button onClick={() => loadExample("A speeding drunk driver hits a pedestrian on a highway and flees the scene without reporting to authorities or providing medical help.")} className="text-xs bg-slate-100 text-slate-600 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors text-left">
                    {t(language, 'Hit & Run Tragedy')}
                  </button>
                  <button onClick={() => loadExample("A cybercriminal creates a fake banking portal and tricks an elderly person into sharing their OTP, wiping out their entire life savings.")} className="text-xs bg-slate-100 text-slate-600 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors text-left">
                    {t(language, 'Online Phishing Scam')}
                  </button>
                  <button onClick={() => loadExample("A newlywed woman faces continuous physical and mental torture from her husband and in-laws demanding a luxury car as dowry.")} className="text-xs bg-slate-100 text-slate-600 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors text-left">
                    {t(language, 'Dowry Harassment')}
                  </button>
                  <button onClick={() => loadExample("A senior manager repeatedly makes unwelcome sexual advances towards a subordinate, threatening job termination if she reports it.")} className="text-xs bg-slate-100 text-slate-600 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors text-left">
                    {t(language, 'Workplace Sexual Harassment')}
                  </button>
                </div>
              </div>

              <button
                onClick={handleAnalyze}
                disabled={!scenario.trim() || isAnalyzing}
                className="w-full bg-slate-800 text-white py-4 rounded-xl font-bold hover:bg-slate-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 group"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t(language, 'oe_analyzing')}
                  </>
                ) : (
                  <>
                    <SearchIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    {t(language, 'oe_run')}
                  </>
                )}
              </button>
              
              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium flex gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Dynamic Results Dashboard */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {!result && !isAnalyzing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full flex items-center justify-center min-h-[400px] border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50"
                >
                  <div className="text-center p-8 max-w-sm">
                    <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Scale className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-700 mb-2">{t(language, 'oe_awaiting')}</h3>
                    <p className="text-slate-500 text-sm">{t(language, 'oe_awaiting_sub')}</p>
                  </div>
                </motion.div>
              )}

              {isAnalyzing && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full flex flex-col items-center justify-center min-h-[400px] bg-white rounded-3xl shadow-xl border border-slate-100"
                >
                  <div className="relative">
                    <div className="w-24 h-24 border-4 border-slate-100 border-t-primary rounded-full animate-spin"></div>
                    <BrainCircuit className="w-8 h-8 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                  </div>
                  <h3 className="mt-6 text-xl font-bold text-slate-700 animate-pulse">Running Statutory Matrix...</h3>
                  <p className="text-slate-400 text-sm mt-2">Checking overlapping Bharatiya Nyaya Sanhita jurisdictions</p>
                </motion.div>
              )}

              {result && !isAnalyzing && (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden"
                >
                  <div className="bg-slate-800 p-8 text-white relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
                    
                    <div className="flex justify-between items-start relative z-10">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h2 className="text-2xl font-bold">{t(language, 'oe_matrix')}</h2>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border ${
                            result.severityLevel === 'Extreme' ? 'bg-red-500/20 text-red-300 border-red-500/50' :
                            result.severityLevel === 'High' ? 'bg-orange-500/20 text-orange-300 border-orange-500/50' :
                            result.severityLevel === 'Medium' ? 'bg-amber-500/20 text-amber-300 border-amber-500/50' :
                            'bg-green-500/20 text-green-300 border-green-500/50'
                          }`}>
                            {t(language, 'oe_severity')}: {result.severityLevel}
                          </span>
                        </div>
                        <p className="text-slate-400 text-sm max-w-md">Multi-dimensional analysis based on overlapping charges and aggravating factors.</p>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400">
                          {result.complexityScore.toFixed(1)}
                        </div>
                        <div className="text-xs uppercase tracking-widest text-slate-500 font-bold mt-1">{t(language, 'oe_out_of')}</div>
                      </div>
                    </div>
                  </div>

                  <div className="p-8">
                    {/* Crimes, BNS & IPC */}
                    <div className="grid md:grid-cols-3 sm:grid-cols-1 gap-6 mb-8">
                      <div>
                        <h4 className="flex items-center gap-2 font-bold text-slate-700 uppercase tracking-widest text-xs mb-4">
                          <Crosshair className="w-4 h-4 text-primary" /> {t(language, 'oe_crimes')}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {result.crimesIdentified.map((crime, i) => (
                            <span key={i} className="bg-slate-100 text-slate-800 border border-slate-200 px-3 py-1.5 rounded-lg text-sm font-medium">
                              {crime}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="flex items-center gap-2 font-bold text-slate-700 uppercase tracking-widest text-xs mb-4">
                          <ShieldAlert className="w-4 h-4 text-primary" /> {t(language, 'oe_bns')}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {result.bnsSections.map((bns, i) => (
                            <span key={i} className="bg-primary/10 text-primary border border-primary/20 px-3 py-1.5 rounded-lg text-sm font-bold">
                              {bns}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="flex items-center gap-2 font-bold text-slate-700 uppercase tracking-widest text-xs mb-4">
                          <ShieldAlert className="w-4 h-4 text-slate-500" /> IPC Section
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {result.ipcSections?.map((ipcVal, i) => (
                            <span key={i} className="bg-slate-100 text-slate-600 border border-slate-200 px-3 py-1.5 rounded-lg text-sm font-medium">
                              {ipcVal}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Aggravating Factors */}
                    {result.aggravatingFactors.length > 0 && (
                      <div className="mb-8">
                        <h4 className="flex items-center gap-2 font-bold text-slate-700 uppercase tracking-widest text-xs mb-4">
                          <FileWarning className="w-4 h-4 text-orange-500" /> {t(language, 'oe_factors')}
                        </h4>
                        <ul className="space-y-2">
                          {result.aggravatingFactors.map((factor, i) => (
                            <li key={i} className="flex gap-3 text-slate-600 text-sm bg-orange-50/50 p-3 rounded-xl border border-orange-100/50">
                              <span className="text-orange-500 mt-0.5">•</span> {factor}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* AI Assessment Glow Box */}
                    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 p-6 rounded-2xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/40 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                      <h4 className="font-bold text-indigo-900 mb-2 flex items-center gap-2">
                        <BrainCircuit className="w-5 h-5 text-indigo-500" /> {t(language, 'oe_assessment')}
                      </h4>
                      <p className="text-indigo-800 leading-relaxed text-sm relative z-10">
                        {result.analysis}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};
