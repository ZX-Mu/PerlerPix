
import React from 'react';
import { HistoryItem, Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { Clock, ChevronRight } from 'lucide-react';

interface Props {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  lang: Language;
}

const History: React.FC<Props> = ({ history, onSelect, lang }) => {
  const t = TRANSLATIONS[lang];

  if (history.length === 0) {
    return (
      <div className="text-center py-20 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
        <div className="bg-slate-50 dark:bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <Clock className="text-slate-300 dark:text-slate-600" size={32} />
        </div>
        <p className="text-slate-500 dark:text-slate-400 font-medium">{t.historyEmpty}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {history.map((item) => (
        <div 
          key={item.id}
          onClick={() => onSelect(item)}
          className="group bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden cursor-pointer hover:shadow-lg hover:border-indigo-200 dark:hover:border-indigo-800 transition-all duration-300 flex flex-col"
        >
          <div className="relative h-48 bg-slate-100 dark:bg-slate-800 overflow-hidden flex items-center justify-center">
             {/* We show the processed grid as a mini preview if possible, or the source image */}
             <img 
              src={item.imageUrl} 
              alt={item.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          </div>
          
          <div className="p-4 flex-1 flex flex-col">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 line-clamp-1" title={item.name}>
                {item.name || 'Untitled'}
              </h3>
            </div>
            
            <div className="flex items-center gap-3 mt-auto text-xs text-slate-500 dark:text-slate-400">
              <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded font-mono">
                {item.grid.width}x{item.grid.height}
              </span>
              <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
            </div>
            
            <button className="mt-3 w-full py-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg group-hover:bg-indigo-600 group-hover:text-white dark:group-hover:bg-indigo-500 transition-colors flex items-center justify-center gap-1">
              {t.useTemplate} <ChevronRight size={12} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default History;