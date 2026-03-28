import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Send, Bot, User, Loader2, Scale, CheckCircle2, ArrowLeft, Trash2 } from 'lucide-react';
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

interface LawMitraPageProps {
  onBack: () => void;
  language: string;
}

export const LawMitraPage = ({ onBack, language }: LawMitraPageProps) => {
  const t = (key: string, params?: Record<string, any>) =>
    i18nT(language as LanguageCode, key, params);

  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: t('welcome_md') }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    const userMessage = input.trim();
    if (!userMessage || isLoading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
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

  const clearChat = () => {
    setMessages([{ role: 'assistant', content: t('welcome_md') }]);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="container-custom h-16 flex items-center justify-between">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-primary font-bold hover:text-accent transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            {t('back')}
          </button>
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2 rounded-lg">
              <Scale className="text-white w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-primary">{t('cat_lawmitra_title')}</h1>
          </div>
          <button 
            onClick={clearChat}
            className="p-2 text-text-muted hover:text-destructive transition-colors"
            title={t('new_chat')}
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Chat Area */}
      <div ref={chatContainerRef} className="flex-grow overflow-y-auto py-8">
        <div className="container-custom max-w-4xl">
          <div className="space-y-6">
            {messages.map((msg, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-accent text-white' : 'bg-primary text-white'}`}>
                    {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                  </div>
                  <div className={`p-5 rounded-2xl text-base leading-relaxed shadow-sm border ${msg.role === 'user' ? 'bg-accent text-white border-accent rounded-tr-none' : 'bg-white text-slate-700 border-slate-100 rounded-tl-none'}`}>
                    <div className="prose prose-slate max-w-none">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                    {msg.isValidated && (
                      <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-bold text-green-600 uppercase tracking-widest">
                        <CheckCircle2 className="w-4 h-4" />
                        {t('status_validated')}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex gap-4 items-center bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                  <Loader2 className="w-5 h-5 text-primary animate-spin" />
                  <span className="text-sm text-text-muted font-medium">{t('assistant_analyzing_legal_concepts')}</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Input Area */}
      <footer className="bg-white border-t border-slate-200 p-6">
        <div className="container-custom max-w-4xl">
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder={t('input_placeholder')}
              className="w-full bg-slate-100 border-none rounded-2xl px-6 py-4 pr-16 text-base focus:ring-2 focus:ring-primary transition-all"
            />
            <button 
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-white p-3 rounded-xl hover:bg-accent transition-colors disabled:opacity-50"
            >
              <Send className="w-6 h-6" />
            </button>
          </div>
          <p className="text-xs text-text-muted mt-4 text-center">
            {t('disclaimer')}
          </p>
        </div>
      </footer>
    </div>
  );
};
