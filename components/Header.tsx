import React from 'react';
import { Grid3X3, Globe, ChevronDown, Sun, Moon, Monitor } from 'lucide-react';
import { TRANSLATIONS } from '../constants';
import { Language, Theme } from '../types';

interface Props {
  lang: Language;
  setLang: (l: Language) => void;
  theme: Theme;
  setTheme: (t: Theme) => void;
}

const Header: React.FC<Props> = ({ lang, setLang, theme, setTheme }) => {
  const t = TRANSLATIONS[lang];

  const toggleTheme = () => {
    const modes: Theme[] = ['light', 'dark', 'system'];
    const next = modes[(modes.indexOf(theme) + 1) % modes.length];
    setTheme(next);
  };

  const ThemeIcon = () => {
    switch (theme) {
      case 'light': return <Sun size={18} />;
      case 'dark': return <Moon size={18} />;
      case 'system': return <Monitor size={18} />;
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div 
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity" 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="bg-indigo-600 p-2 rounded-lg shadow-md">
              <Grid3X3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">{t.title}</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t.subtitle}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
              title={`Theme: ${theme}`}
            >
              <ThemeIcon />
            </button>

            <div className="relative group">
               <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700 px-3 py-1.5 rounded-full transition-colors border border-transparent hover:border-indigo-100 dark:hover:border-slate-600 cursor-pointer">
                 <Globe size={14} className="text-slate-500 dark:text-slate-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400" />
                 <select 
                    value={lang}
                    onChange={(e) => setLang(e.target.value as Language)}
                    className="bg-transparent text-sm font-bold text-slate-600 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 outline-none appearance-none cursor-pointer w-full min-w-[60px] py-0.5"
                 >
                   <option value="zh" className="dark:bg-slate-800">中文</option>
                   <option value="en" className="dark:bg-slate-800">English</option>
                 </select>
                 <ChevronDown size={14} className="text-slate-400 pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" />
               </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;