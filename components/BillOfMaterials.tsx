import React, { useState } from 'react';
import { PaletteColor, GridData, Language } from '../types';
import { BEAD_SIZE_MM, TRANSLATIONS, PERLER_PALETTE } from '../constants';
import { Download, Ruler, RefreshCcw, X, Search, Check, Paintbrush } from 'lucide-react';

interface Props {
  palette: PaletteColor[];
  grid: GridData;
  lang: Language;
  onColorReplace?: (oldHex: string, newHex: string) => void;
  onSelectColor?: (hex: string) => void;
  selectedColor?: string | null;
}

const BillOfMaterials: React.FC<Props> = ({ palette, grid, lang, onColorReplace, onSelectColor, selectedColor }) => {
  const t = TRANSLATIONS[lang];
  const [editingColor, setEditingColor] = useState<PaletteColor | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const totalBeads = palette.reduce((acc, curr) => acc + curr.count, 0);
  const widthCm = ((grid.width * BEAD_SIZE_MM) / 10).toFixed(1);
  const heightCm = ((grid.height * BEAD_SIZE_MM) / 10).toFixed(1);

  const downloadCSV = () => {
    const headers = "Name,Hex,R,G,B,Count\n";
    const rows = palette.map(c => `${c.name},${c.hex},${c.r},${c.g},${c.b},${c.count}`).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'perler_project_colors.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReplace = (newHex: string) => {
    if (editingColor && onColorReplace) {
      onColorReplace(editingColor.hex, newHex);
      setEditingColor(null);
    }
  };

  const filteredPalette = PERLER_PALETTE.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 h-full flex flex-col relative">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-bold text-slate-900">{t.bomTitle}</h2>
        <div className="flex gap-2">
          <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-md">
            {totalBeads} Beads
          </span>
        </div>
      </div>
      
      <p className="text-xs text-slate-400 mb-4 flex items-center gap-1">
         <Paintbrush size={12} /> 点击颜色行开启画笔，点击 <RefreshCcw size={10} className="inline" /> 批量替换
      </p>

      <div className="bg-slate-50 rounded-lg p-4 mb-6 flex items-center gap-4 border border-slate-100">
        <div className="bg-white p-2 rounded-full shadow-sm text-indigo-600">
          <Ruler size={20} />
        </div>
        <div>
          <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">{t.finishedSize} (2.6mm)</p>
          <p className="text-sm font-semibold text-slate-800">{widthCm}cm x {heightCm}cm</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-3">
        {palette.map((color) => {
          const isSelected = selectedColor === color.hex;
          return (
            <div 
              key={color.id} 
              className={`flex items-center justify-between group p-2 rounded-lg transition-all cursor-pointer border-l-4 ${isSelected ? 'bg-indigo-50 border-l-indigo-500 shadow-sm' : 'hover:bg-slate-50 border-l-transparent hover:border-l-slate-300'}`}
              onClick={() => onSelectColor && onSelectColor(color.hex)}
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-8 h-8 rounded-full border border-slate-200 shadow-sm relative flex items-center justify-center"
                  style={{ backgroundColor: color.hex }}
                >
                  <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-black/5"></div>
                  {isSelected && <Paintbrush size={14} className={color.r + color.g + color.b > 400 ? 'text-black' : 'text-white'} />}
                </div>
                <div className="flex flex-col">
                  <span className={`text-sm font-bold ${isSelected ? 'text-indigo-900' : 'text-slate-800'}`}>{color.name}</span>
                  <span className="text-[10px] text-slate-400 uppercase">{color.hex}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                 <span className={`font-mono text-sm font-bold px-2 py-0.5 rounded ${isSelected ? 'bg-white text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
                   x{color.count}
                 </span>
                 
                 <button
                    className={`p-1.5 rounded-md hover:bg-white hover:shadow-sm transition-all ${isSelected ? 'text-indigo-400 hover:text-indigo-600' : 'text-slate-300 hover:text-indigo-500 opacity-0 group-hover:opacity-100'}`}
                    onClick={(e) => {
                       e.stopPropagation();
                       setEditingColor(color);
                    }}
                    title="Replace all"
                 >
                    <RefreshCcw size={14} />
                 </button>
              </div>
            </div>
          );
        })}
      </div>
      
      <button 
        onClick={downloadCSV}
        className="mt-6 flex items-center justify-center gap-2 w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-semibold transition-all"
      >
        <Download size={16} />
        {t.exportCsv}
      </button>

      {/* Color Picker Modal */}
      {editingColor && (
        <div className="absolute inset-0 z-20 bg-white rounded-xl flex flex-col p-4 animate-in fade-in zoom-in-95 duration-200 border border-slate-200 shadow-lg">
           <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-800">替换颜色</h3>
                <div className="flex items-center gap-2 mt-1">
                   <div className="w-3 h-3 rounded-full border border-slate-200" style={{background: editingColor.hex}}></div>
                   <p className="text-xs text-slate-500">将 <span className="font-medium text-slate-700">{editingColor.name}</span> 替换为...</p>
                </div>
              </div>
              <button 
                onClick={() => setEditingColor(null)}
                className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
           </div>

           <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input 
                type="text" 
                placeholder="搜索颜色名称..." 
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
           </div>

           <div className="flex-1 overflow-y-auto grid grid-cols-4 gap-2 content-start pr-1">
              {filteredPalette.map((p) => (
                 <button
                   key={p.hex}
                   onClick={() => handleReplace(p.hex)}
                   className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all group"
                   title={p.name}
                 >
                    <div className="w-8 h-8 rounded-full border border-slate-200 shadow-sm relative" style={{background: p.hex}}>
                       {p.hex === editingColor.hex && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-full">
                             <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                       )}
                    </div>
                    <span className="text-[10px] text-slate-500 text-center line-clamp-1 w-full group-hover:text-slate-900">{p.name}</span>
                 </button>
              ))}
           </div>
        </div>
      )}
    </div>
  );
};

export default BillOfMaterials;