import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, Bot, User, Loader2, Scale, CheckCircle2 } from 'lucide-react';
import { solve, LegalAnswer } from '../services/legalService';
import ReactMarkdown from 'react-markdown';
import { t as i18nT } from '../utils/i18n';
import type { LanguageCode } from '../languages';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  isValidated?: boolean;
  answerData?: LegalAnswer;
}

interface LegalAssistantProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  initialMessage?: string;
  language?: string;
}

export const LegalAssistant = ({ isOpen, setIsOpen, initialMessage, language = 'en' }: LegalAssistantProps) => {
  const t = (key: string) => i18nT(language as LanguageCode, key);

  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: t('welcome_md') }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialMessage) {
      setMessages(prev => [...prev, { role: 'user', content: initialMessage }]);
      handleSend(initialMessage);
    }
  }, [initialMessage]);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (textOverride?: string) => {
    const userMessage = (textOverride || input).trim();
    if (!userMessage || isLoading) return;

    if (!textOverride) setInput('');
    if (!textOverride) setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const result = await solve(userMessage, language,
        messages.map(m => ({ role: m.role, content: m.content }))
      );
      
      let content = result.answer.explanation;
      if (result.answer.crime && result.answer.crime !== "General Legal Information") {
        content = `**${result.answer.crime}**\n\n- **Section:** ${result.answer.section}\n- **Law:** ${result.answer.law}\n- **Punishment:** ${result.answer.punishment}\n\n${result.answer.explanation}`;
      }

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content,
        isValidated: result.status === "✅ Passed" || result.status === "ℹ️ Found in Reference",
        answerData: result.answer
      }]);
    } catch (error) {
      console.error('AI Error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm having trouble connecting right now. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-[350px] md:w-[400px] h-[500px] flex flex-col overflow-hidden mb-6"
          >
            {/* Header */}
            <div className="bg-primary p-4 flex justify-between items-center text-white">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">{t('page_title')}</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-[10px] text-slate-300 uppercase tracking-widest font-bold">AI Powered</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div ref={chatContainerRef} className="flex-grow overflow-y-auto p-4 space-y-4 bg-slate-50">
              {messages.map((msg, i) => (
                <div 
                  key={i} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-accent text-white' : 'bg-primary text-white'}`}>
                      {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>
                    <div className={`p-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-accent text-white rounded-tr-none' : 'bg-white text-slate-700 shadow-sm border border-slate-100 rounded-tl-none'}`}>
                      <div className="prose prose-slate max-w-none">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                      {msg.isValidated && (
                        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2 text-[10px] font-bold text-green-600 uppercase tracking-widest">
                          <CheckCircle2 className="w-3 h-3" />
                          {t('status_validated')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex gap-2 items-center bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
                    <Loader2 className="w-4 h-4 text-primary animate-spin" />
                    <span className="text-xs text-text-muted">{t('assistant_analyzing_legal_concepts')}</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-slate-100">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={t('input_placeholder')}
                  className="flex-grow bg-slate-100 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary"
                />
                <button 
                  onClick={() => handleSend()}
                  disabled={isLoading || !input.trim()}
                  className="bg-primary text-white p-2 rounded-xl hover:bg-accent transition-colors disabled:opacity-50"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              <p className="text-[10px] text-text-muted mt-3 text-center">
                {t('disclaimer')}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="bg-primary text-white w-16 h-16 rounded-full shadow-2xl flex items-center justify-center hover:bg-accent transition-colors relative group"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
        {!isOpen && (
          <div className="absolute right-full mr-4 bg-white text-primary px-4 py-2 rounded-xl shadow-lg border border-slate-100 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none font-bold text-sm">
            {t('assistant_need_help_tooltip')}
          </div>
        )}
      </motion.button>
    </div>
  );
};
