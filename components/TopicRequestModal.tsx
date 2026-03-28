import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, BookOpen, Send, CheckCircle2 } from 'lucide-react';
import { t as i18nT } from '../utils/i18n';
import type { LanguageCode } from '../languages';

interface TopicRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: LanguageCode;
}

export const TopicRequestModal = ({ isOpen, onClose, language }: TopicRequestModalProps) => {
  const [form, setForm] = useState({ topic: '', category: '', description: '', email: '' });
  const [submitted, setSubmitted] = useState(false);

  const t = (key: string) => i18nT(language, key);

  const categories = [
    { value: 'Criminal Law', label: t('topic_request_cat_criminal_law') },
    { value: 'Civil Rights', label: t('topic_request_cat_civil_rights') },
    { value: 'Housing Law', label: t('topic_request_cat_housing_law') },
    { value: 'Family Law', label: t('topic_request_cat_family_law') },
    { value: 'Consumer Rights', label: t('topic_request_cat_consumer_rights') },
    { value: 'Cyber Law', label: t('topic_request_cat_cyber_law') },
    { value: 'Labour Law', label: t('topic_request_cat_labour_law') },
    { value: 'Other', label: t('topic_request_cat_other') },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setForm({ topic: '', category: '', description: '', email: '' });
      onClose();
    }, 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
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
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg pointer-events-auto overflow-hidden">
              {/* Header */}
              <div className="bg-primary px-8 py-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <BookOpen className="text-white w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-bold text-white">{t('topic_request_title')}</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-8">
                {submitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-8 gap-4 text-center"
                  >
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-primary">{t('topic_request_submitted_title')}</h3>
                    <p className="text-text-muted text-sm">{t('topic_request_submitted_body')}</p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-primary mb-2">{t('topic_request_topic_name_label')}</label>
                      <input
                        type="text"
                        required
                        value={form.topic}
                        onChange={(e) => setForm({ ...form, topic: e.target.value })}
                        placeholder={t('topic_request_topic_name_placeholder')}
                        className="w-full bg-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-primary mb-2">{t('topic_request_category_label')}</label>
                      <select
                        required
                        value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                        className="w-full bg-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all appearance-none cursor-pointer"
                      >
                        <option value="" disabled>{t('topic_request_category_select_placeholder')}</option>
                        {categories.map((cat) => (
                          <option key={cat.value} value={cat.value}>{cat.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-primary mb-2">{t('topic_request_description_label')}</label>
                      <textarea
                        required
                        rows={3}
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        placeholder={t('topic_request_description_placeholder')}
                        className="w-full bg-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-primary mb-2">{t('topic_request_email_label')}</label>
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder={t('topic_request_email_placeholder')}
                        className="w-full bg-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-primary text-white py-3 rounded-full font-bold hover:bg-accent transition-colors flex items-center justify-center gap-2"
                    >
                      {t('topic_request_submit_button')}
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
