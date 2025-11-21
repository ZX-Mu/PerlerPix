

import React from 'react';
import { Grid3X3, Globe, ChevronDown } from 'lucide-react';
import { TRANSLATIONS } from '../constants';
import { Language } from '../types';

interface Props {
  lang: Language;
  setLang: (l: Language) => void;
}

const Header: React.FC<Props> = ({ lang, setLang }) => {
  const t = TRANSLATIONS[lang];

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
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
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">{t.title}</h1>
              <p className="text-xs text-slate-500 font-medium">{t.subtitle}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="relative group">
               <div className="flex items-center gap-2 bg-slate-100 hover:bg-indigo-50 px-3 py-1.5 rounded-full transition-colors border border-transparent hover:border-indigo-100 cursor-pointer">
                 <Globe size={14} className="text-slate-500 group-hover:text-indigo-500" />
                 <select 
                    value={lang}
                    onChange={(e) => setLang(e.target.value as Language)}
                    className="bg-transparent text-sm font-bold text-slate-600 group-hover:text-indigo-600 outline-none appearance-none cursor-pointer w-full min-w-[60px] py-0.5"
                 >
                   <option value="zh">中文</option>
                   <option value="en">English</option>
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