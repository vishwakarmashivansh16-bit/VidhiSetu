import React, { useState } from 'react';
import { Search, Menu, X, Scale, BookOpen, HelpCircle, FileText, Globe, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { t } from '../utils/i18n';
import { SUPPORTED_LANGUAGES, type LanguageCode } from '../languages';

interface NavbarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onLogoClick: () => void;
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  setView: (view: 'home' | 'topic' | 'search' | 'lawmitra' | 'common-laws') => void;
}

export const Navbar = ({ searchQuery, setSearchQuery, onLogoClick, language, setLanguage, setView }: NavbarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const tt = (key: string) => t(language as LanguageCode, key);

  const navLinks = [
    { name: tt('cat_lawmitra_title'), icon: Bot, view: 'lawmitra' as const },
    { name: tt('cat_common_laws_title'), icon: BookOpen, view: 'common-laws' as const },
  ];

  const languages = SUPPORTED_LANGUAGES;

  return (
    <nav className="glass-nav sticky top-0 z-50">
      <div className="container-custom">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div 
            className="flex items-center gap-2 cursor-pointer group"
            onClick={onLogoClick}
          >
            <div className="bg-primary p-2 rounded-lg group-hover:bg-accent transition-colors">
              <Scale className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-tight text-primary">VidhiSetu</span>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex items-center flex-1 max-w-sm mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value) setView('search');
                }}
                placeholder="Search legal topics..."
                className="w-full bg-slate-100 border border-slate-200 rounded-full pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              />
            </div>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => setView(link.view)}
                className="text-sm font-medium text-text-muted hover:text-primary transition-colors flex items-center gap-2"
              >
                <link.icon className="w-4 h-4" />
                {link.name}
              </button>
            ))}
            
            {/* Language Selector */}
            <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
              <Globe className="w-4 h-4 text-primary" />
              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value as LanguageCode)}
                className="bg-transparent text-xs font-bold text-primary focus:outline-none cursor-pointer"
              >
                {languages.map(lang => (
                  <option key={lang.code} value={lang.code}>{lang.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center gap-4">
            <div className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-full border border-slate-200">
              <Globe className="w-3 h-3 text-primary" />
              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value as LanguageCode)}
                className="bg-transparent text-[10px] font-bold text-primary focus:outline-none"
              >
                {languages.map(lang => (
                  <option key={lang.code} value={lang.code}>{lang.code.toUpperCase()}</option>
                ))}
              </select>
            </div>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-primary"
            >
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-slate-200 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-4">
              {navLinks.map((link) => (
                <button
                  key={link.name}
                  className="w-full flex items-center gap-3 px-3 py-2 text-base font-medium text-text-muted hover:text-primary hover:bg-slate-50 rounded-lg transition-all"
                  onClick={() => {
                    setView(link.view);
                    setIsMenuOpen(false);
                  }}
                >
                  <link.icon className="w-5 h-5" />
                  {link.name}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
