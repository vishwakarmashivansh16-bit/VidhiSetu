import React, { useState } from 'react';
import { Scale, Globe, Mail, MessageSquare } from 'lucide-react';
import { Toast } from './Toast';
import { LegalModal } from './LegalModal';
import { t as i18nT } from '../utils/i18n';
import type { LanguageCode } from '../languages';

interface FooterProps {
  setView: (view: 'home' | 'topic' | 'search' | 'lawmitra' | 'common-laws') => void;
  onContactClick: () => void;
  language: LanguageCode;
}

export const Footer = ({ setView, onContactClick, language }: FooterProps) => {
  const [email, setEmail] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [legalModal, setLegalModal] = useState<'privacy' | 'terms' | 'accessibility' | null>(null);
  const t = (key: string) => i18nT(language, key);

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setEmail('');
    setToastVisible(true);
  };

  return (
    <>
      <footer className="bg-primary text-white pt-20 pb-10">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

            {/* Brand */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <div className="bg-white p-2 rounded-lg">
                  <Scale className="text-primary w-6 h-6" />
                </div>
                <span className="text-xl font-bold tracking-tight">NyayMitra</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                {t('footer_brand_tagline')}
              </p>
              <div className="flex gap-4">
                <a href="https://nyaymitra.in" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors" title="Website">
                  <Globe className="w-5 h-5" />
                </a>
                <button onClick={onContactClick} className="text-slate-400 hover:text-white transition-colors" title="Contact Us">
                  <MessageSquare className="w-5 h-5" />
                </button>
                <a href="mailto:hello@nyaymitra.in" className="text-slate-400 hover:text-white transition-colors" title="Email Us">
                  <Mail className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-bold mb-6">{t('footer_quick_links_title')}</h4>
              <ul className="space-y-4 text-sm text-slate-400">
                <li>
                  <button onClick={() => setView('lawmitra')} className="hover:text-white transition-colors text-left">
                    {t('footer_link_lawmmitra')}
                  </button>
                </li>
                <li>
                  <button onClick={() => setView('common-laws')} className="hover:text-white transition-colors text-left">
                    {t('footer_link_common_laws')}
                  </button>
                </li>
                <li>
                  <button onClick={() => setView('search')} className="hover:text-white transition-colors text-left">
                    {t('footer_link_all_legal_topics')}
                  </button>
                </li>
                <li>
                  <button onClick={onContactClick} className="hover:text-white transition-colors text-left">
                    {t('footer_link_contact_us')}
                  </button>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="text-lg font-bold mb-6">{t('footer_resources_title')}</h4>
              <ul className="space-y-4 text-sm text-slate-400">
                <li>
                  <a href="https://nalsa.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                    {t('footer_resource_nalsa')}
                  </a>
                </li>
                <li>
                  <a href="https://doj.gov.in/legal-aid" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                    {t('footer_resource_public_defenders')}
                  </a>
                </li>
                <li>
                  <a href="https://cybercrime.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                    {t('footer_resource_cyber_crime_portal')}
                  </a>
                </li>
                <li>
                  <a href="https://rtionline.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                    {t('footer_resource_rti_portal')}
                  </a>
                </li>
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h4 className="text-lg font-bold mb-6">{t('footer_newsletter_title')}</h4>
              <p className="text-sm text-slate-400 mb-4">{t('footer_newsletter_desc')}</p>
              <form onSubmit={handleNewsletter} className="flex gap-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('footer_email_placeholder')}
                  className="bg-slate-800 border-none rounded-lg px-4 py-2 text-sm w-full text-white placeholder-slate-500 focus:ring-2 focus:ring-accent focus:outline-none"
                />
                <button type="submit" className="bg-accent text-white p-2 rounded-lg hover:bg-amber-700 transition-colors flex-shrink-0">
                  <Mail className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-10 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500 font-medium uppercase tracking-widest">
            <p>{t('footer_copyright')}</p>
            <div className="flex gap-8">
              <button onClick={() => setLegalModal('privacy')} className="hover:text-white transition-colors">{t('footer_privacy_policy')}</button>
              <button onClick={() => setLegalModal('terms')} className="hover:text-white transition-colors">{t('footer_terms_of_service')}</button>
              <button onClick={() => setLegalModal('accessibility')} className="hover:text-white transition-colors">{t('footer_accessibility')}</button>
            </div>
          </div>
        </div>
      </footer>

      <Toast
        message="You're subscribed! We'll keep you updated."
        isVisible={toastVisible}
        onHide={() => setToastVisible(false)}
      />
      <LegalModal
        type={legalModal}
        onClose={() => setLegalModal(null)}
        language={language}
      />
    </>
  );
};
