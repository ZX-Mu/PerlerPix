
import React from 'react';
import { PaletteColor, GridData, Language } from '../types';
import { BEAD_SIZE_MM, TRANSLATIONS } from '../constants';
import { Download, Ruler } from 'lucide-react';

interface Props {
  palette: PaletteColor[];
  grid: GridData;
  lang: Language;
}

const BillOfMaterials: React.FC<Props> = ({ palette, grid, lang }) => {
  const t = TRANSLATIONS[lang];
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

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-slate-900">{t.bomTitle}</h2>
        <div className="flex gap-2">
          <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-md">
            {totalBeads} Beads
          </span>
        </div>
      </div>

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
        {palette.map((color) => (
          <div key={color.id} className="flex items-center justify-between group p-1 hover:bg-slate-50 rounded transition-colors">
            <div className="flex items-center gap-3">
              <div 
                className="w-8 h-8 rounded-full border border-slate-200 shadow-sm relative"
                style={{ backgroundColor: color.hex }}
              >
                <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-black/5"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-800">{color.name}</span>
                <span className="text-[10px] text-slate-400 uppercase">{color.hex}</span>
              </div>
            </div>
            <span className="font-mono text-sm font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
              x{color.count}
            </span>
          </div>
        ))}
      </div>
      
      <button 
        onClick={downloadCSV}
        className="mt-6 flex items-center justify-center gap-2 w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-semibold transition-all"
      >
        <Download size={16} />
        {t.exportCsv}
      </button>
    </div>
  );
};

export default BillOfMaterials;
