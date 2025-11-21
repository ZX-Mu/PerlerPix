import React from 'react';
import { SAMPLE_LIBRARY } from '../constants';
import { LibraryItem } from '../types';

interface Props {
  onSelect: (item: LibraryItem) => void;
}

const Library: React.FC<Props> = ({ onSelect }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {SAMPLE_LIBRARY.map((item) => (
        <div 
          key={item.id}
          onClick={() => onSelect(item)}
          className="group bg-white rounded-xl border border-slate-200 overflow-hidden cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
        >
          <div className="aspect-square overflow-hidden bg-slate-100 relative">
            <img 
              src={item.imageUrl} 
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
               <span className="text-white font-bold text-sm">Use Template</span>
            </div>
          </div>
          <div className="p-4">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-slate-900">{item.title}</h3>
              <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
                {item.category}
              </span>
            </div>
            <p className="text-sm text-slate-500 line-clamp-2">{item.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Library;