

import React, { useState, useRef, useEffect } from 'react';
import Header from './components/Header';
import PixelGrid from './components/PixelGrid';
import BillOfMaterials from './components/BillOfMaterials';
import History from './components/History';
import { generatePatternImage } from './services/gemini';
import { processImageToGrid } from './services/imageProcessor';
import { Pattern, GenerationMode, HistoryItem, Language, PaletteColor, Theme } from './types';
import { GRID_SIZES, TRANSLATIONS, PERLER_PALETTE } from './constants';
import { 
  Wand2, 
  Image as ImageIcon, 
  History as HistoryIcon, 
  AlertCircle, 
  Loader2, 
  X,
  Layers,
  SplitSquareHorizontal,
  Maximize2,
  Paintbrush,
  Check
} from 'lucide-react';

type ViewMode = 'pattern' | 'original' | 'compare';

function App() {
  const [lang, setLang] = useState<Language>('zh');
  const [mode, setMode] = useState<GenerationMode>('text');
  const [prompt, setPrompt] = useState('');
  const [gridSize, setGridSize] = useState(48);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPattern, setCurrentPattern] = useState<Pattern | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('pattern');
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  
  // Theme state
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('theme') as Theme) || 'system';
    }
    return 'system';
  });

  const t = TRANSLATIONS[lang];
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Apply theme effect
  useEffect(() => {
    const root = window.document.documentElement;
    const applyTheme = () => {
       const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
       const isDark = theme === 'dark' || (theme === 'system' && systemDark);
       
       if (isDark) {
         root.classList.add('dark');
       } else {
         root.classList.remove('dark');
       }
    };

    applyTheme();
    localStorage.setItem('theme', theme);

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => applyTheme();
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, [theme]);

  const addToHistory = (pattern: Pattern) => {
    setHistory(prev => {
      const filtered = prev.filter(p => p.id !== pattern.id);
      return [pattern, ...filtered];
    });
  };

  const updatePatternState = (newPixels: string[]) => {
    if (!currentPattern) return;

    const paletteCounts: Record<string, number> = {};
    newPixels.forEach(hex => {
      if (hex !== 'TRANSPARENT') paletteCounts[hex] = (paletteCounts[hex] || 0) + 1;
    });

    const activePalette: PaletteColor[] = [];
    Object.entries(paletteCounts)
      .sort(([,a], [,b]) => b - a)
      .forEach(([hex, count], idx) => {
          const ref = PERLER_PALETTE.find(p => p.hex === hex);
          const r = parseInt(hex.slice(1, 3), 16);
          const g = parseInt(hex.slice(3, 5), 16);
          const b = parseInt(hex.slice(5, 7), 16);
          
          activePalette.push({
            r, g, b,
            hex,
            name: ref?.name || 'Custom',
            count,
            id: `bead-${idx}`
          });
      });

    const updatedPattern = {
      ...currentPattern,
      grid: { ...currentPattern.grid, pixels: newPixels },
      palette: activePalette
    };

    setCurrentPattern(updatedPattern);
    setHistory(prev => prev.map(p => p.id === updatedPattern.id ? updatedPattern : p));
  };

  const handleColorReplace = (oldHex: string, newHex: string) => {
    if (!currentPattern) return;
    const newPixels = currentPattern.grid.pixels.map(p => p === oldHex ? newHex : p);
    updatePatternState(newPixels);
  };

  const handlePixelClick = (x: number, y: number) => {
    if (!currentPattern || !selectedColor) return;
    if (viewMode !== 'pattern') return;

    const index = y * currentPattern.grid.width + x;
    if (index >= 0 && index < currentPattern.grid.pixels.length) {
       const newPixels = [...currentPattern.grid.pixels];
       newPixels[index] = selectedColor;
       updatePatternState(newPixels);
    }
  };

  const handleGenerateText = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    setError(null);
    setCurrentPattern(null);
    setViewMode('pattern'); 
    
    try {
      const base64Image = await generatePatternImage(prompt);
      const { grid, palette } = await processImageToGrid(base64Image, gridSize);
      
      const newPattern: Pattern = {
        id: Date.now().toString(),
        name: prompt,
        timestamp: Date.now(),
        grid,
        palette,
        beadSizeMm: 2.6,
        imageUrl: base64Image
      };

      setCurrentPattern(newPattern);
      addToHistory(newPattern);
    } catch (err: any) {
      setError(err.message || t.errorGen);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        if (event.target?.result) {
          setIsLoading(true);
          setError(null);
          setCurrentPattern(null);
          setViewMode('pattern'); 

          try {
            const imageUrl = event.target.result as string;
            const { grid, palette } = await processImageToGrid(imageUrl, gridSize);
            
            const newPattern: Pattern = {
              id: Date.now().toString(),
              name: file.name,
              timestamp: Date.now(),
              grid,
              palette,
              beadSizeMm: 2.6,
              imageUrl
            };

            setCurrentPattern(newPattern);
            addToHistory(newPattern);
          } catch (err: any) {
            setError(t.errorImg);
          } finally {
            setIsLoading(false);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleHistorySelect = (item: HistoryItem) => {
    setCurrentPattern(item);
    setViewMode('pattern');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getSelectedColorName = () => {
    if (!selectedColor) return '';
    return PERLER_PALETTE.find(p => p.hex === selectedColor)?.name || selectedColor;
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-20 transition-colors">
      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <Header lang={lang} setLang={setLang} theme={theme} setTheme={setTheme} />

      {isLightboxOpen && currentPattern && (
        <div 
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]"
          onClick={() => setIsLightboxOpen(false)}
        >
          <button 
            className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors p-2 bg-black/20 rounded-full hover:bg-black/40"
            onClick={() => setIsLightboxOpen(false)}
          >
            <X size={32} />
          </button>
          <img 
            src={currentPattern.imageUrl} 
            className="max-w-full max-h-[85vh] object-contain shadow-2xl rounded-lg" 
            alt="Full size source"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="absolute bottom-8 left-0 right-0 text-center text-white/80 font-medium">
             {currentPattern.name}
          </div>
        </div>
      )}

      <div className="bg-gradient-to-b from-indigo-600 to-indigo-800 dark:from-indigo-900 dark:to-slate-900 text-white py-16 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/pixel-weave.png')]"></div>
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 relative z-10">
          {t.heroTitle} <span className="text-yellow-300">{t.heroHighlight}</span>
        </h1>
        <p className="text-indigo-100 dark:text-indigo-200 text-lg max-w-2xl mx-auto relative z-10">
          {t.heroDesc}
        </p>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20" id="generator">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 p-1 mb-8 transition-colors">
          <div className="flex border-b border-slate-100 dark:border-slate-800">
            <button 
              onClick={() => setMode('text')}
              className={`flex-1 py-4 px-2 sm:px-6 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${mode === 'text' ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/20' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              <Wand2 size={18} />
              <span className="hidden sm:inline">{t.modeText}</span>
              <span className="sm:hidden">AI</span>
            </button>
            <button 
              onClick={() => setMode('image')}
              className={`flex-1 py-4 px-2 sm:px-6 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${mode === 'image' ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/20' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              <ImageIcon size={18} />
              <span className="hidden sm:inline">{t.modeImage}</span>
              <span className="sm:hidden">Image</span>
            </button>
            <button 
              onClick={() => setMode('history')}
              className={`flex-1 py-4 px-2 sm:px-6 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${mode === 'history' ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/20' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              <HistoryIcon size={18} />
              <span className="hidden sm:inline">{t.modeHistory}</span>
              <span className="sm:hidden">History</span>
            </button>
          </div>

          <div className="p-6 md:p-8">
            {mode !== 'history' && (
              <div className="flex flex-wrap gap-6 mb-6 items-center">
                 <div className="flex items-center gap-3 w-full sm:w-auto">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">{t.gridLabel}</label>
                    <select 
                      value={gridSize}
                      onChange={(e) => setGridSize(Number(e.target.value))}
                      className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
                    >
                      {GRID_SIZES.map(s => (
                        <option key={s.value} value={s.value}>
                          {(t as any)[s.key]}
                        </option>
                      ))}
                    </select>
                 </div>
              </div>
            )}

            {mode === 'text' && (
              <div className="flex flex-col sm:flex-row gap-4">
                <input 
                  type="text" 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={t.promptPlaceholder}
                  className="flex-1 p-4 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 shadow-sm"
                  onKeyDown={(e) => e.key === 'Enter' && handleGenerateText()}
                />
                <button 
                  onClick={handleGenerateText}
                  disabled={isLoading || !prompt.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 disabled:bg-indigo-300 dark:disabled:bg-indigo-800/50 text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none transition-all flex items-center gap-2 min-w-[140px] justify-center"
                >
                  {isLoading ? <Loader2 className="animate-spin" /> : <Wand2 size={20} />}
                  {t.generateBtn}
                </button>
              </div>
            )}

            {mode === 'image' && (
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-12 text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleImageUpload}
                />
                <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  {isLoading ? <Loader2 className="animate-spin" /> : <ImageIcon size={32} />}
                </div>
                <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">{t.uploadTitle}</h3>
                <p className="text-slate-500 dark:text-slate-400 mt-1">{t.uploadDesc}</p>
              </div>
            )}

            {mode === 'history' && (
              <History history={history} onSelect={handleHistorySelect} lang={lang} />
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r mb-8 flex items-center gap-3 text-red-700 dark:text-red-400">
             <AlertCircle size={20} />
             <p>{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
               <div className="h-8 w-1/3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
               <div className="h-[550px] w-full bg-slate-100 dark:bg-slate-800 rounded-xl relative overflow-hidden border border-slate-200 dark:border-slate-700">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 dark:via-white/5 to-transparent w-full h-full -translate-x-full animate-[shimmer_1.5s_infinite]"></div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 gap-3">
                      <Loader2 className="animate-spin text-indigo-400" size={48} />
                      <p className="font-medium text-indigo-900/50 dark:text-indigo-300/50 animate-pulse tracking-wide">{t.loading}</p>
                  </div>
               </div>
            </div>
            <div className="lg:col-span-1">
               <div className="h-full bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
                  <div className="h-6 w-1/2 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                  <div className="space-y-2 mt-8">
                     {[1,2,3,4,5,6,7,8].map(i => (
                       <div key={i} className="h-8 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" style={{ animationDelay: `${i * 100}ms` }}></div>
                     ))}
                  </div>
               </div>
            </div>
          </div>
        ) : currentPattern ? (
          <div key={currentPattern.id} className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-[fadeIn_0.6s_ease-out]">
            <div className="lg:col-span-2 space-y-6">
               <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t.previewTitle}</h2>
                  <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                     <button 
                        onClick={() => setViewMode('pattern')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-bold transition-all ${viewMode === 'pattern' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                     >
                        <Layers size={14} /> {t.viewPattern}
                     </button>
                     <button 
                        onClick={() => setViewMode('original')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-bold transition-all ${viewMode === 'original' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                     >
                        <ImageIcon size={14} /> {t.viewOriginal}
                     </button>
                     <button 
                        onClick={() => setViewMode('compare')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-bold transition-all ${viewMode === 'compare' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                     >
                        <SplitSquareHorizontal size={14} /> {t.viewCompare}
                     </button>
                  </div>
               </div>
               
               <div className="relative bg-slate-50 dark:bg-slate-800/50 rounded-xl shadow-inner border border-slate-200 dark:border-slate-800 overflow-hidden h-[550px] flex flex-col group">
                  
                  {/* PAINT MODE TOOLBAR - FULL WIDTH BOTTOM */}
                  {selectedColor && viewMode === 'pattern' && (
                    <div className="absolute bottom-0 left-0 right-0 z-30 bg-slate-900/95 dark:bg-black/95 text-white p-4 backdrop-blur-md animate-in slide-in-from-bottom-full flex items-center justify-between shadow-lg">
                       <div className="flex items-center gap-4">
                          <div className="flex flex-col">
                             <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">当前模式</span>
                             <span className="text-sm font-bold flex items-center gap-2">
                                <Paintbrush size={14} className="text-yellow-400" /> 
                                画笔填色
                             </span>
                          </div>
                          <div className="h-8 w-px bg-white/20"></div>
                          <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-full border-2 border-white shadow-sm ring-2 ring-white/20" style={{background: selectedColor}}></div>
                             <div className="flex flex-col">
                                <span className="text-[10px] text-slate-400">正在使用</span>
                                <span className="text-sm font-bold">{getSelectedColorName()}</span>
                             </div>
                          </div>
                          <div className="hidden sm:block text-xs text-slate-400 ml-4">
                             👉 点击上方网格，将该颜色填充到格子中
                          </div>
                       </div>
                       
                       <button 
                         onClick={() => setSelectedColor(null)}
                         className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-bold transition-colors flex items-center gap-2"
                       >
                          <Check size={16} /> 完成
                       </button>
                    </div>
                  )}

                  {viewMode === 'pattern' && (
                    <div className={`flex-1 w-full h-full overflow-hidden relative ${selectedColor ? 'cursor-crosshair' : ''}`}>
                       <PixelGrid 
                          grid={currentPattern.grid} 
                          className="w-full h-full" 
                          onPixelClick={handlePixelClick}
                       />
                    </div>
                  )}

                  {viewMode === 'original' && (
                    <div 
                      className="flex-1 p-8 flex justify-center items-center w-full h-full cursor-zoom-in relative"
                      onClick={() => setIsLightboxOpen(true)}
                    >
                       <img 
                         src={currentPattern.imageUrl} 
                         className="max-w-full max-h-full object-contain shadow-lg rounded-lg bg-white" 
                         alt="original" 
                       />
                       <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          <span className="bg-black/60 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 backdrop-blur-sm">
                             <Maximize2 size={16} /> {t.zoom}
                          </span>
                       </div>
                    </div>
                  )}

                  {viewMode === 'compare' && (
                    <div className="flex-1 p-4 w-full h-full flex flex-col">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-0">
                          <div className="flex flex-col gap-2 h-full">
                             <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase text-center bg-slate-200/50 dark:bg-slate-700/50 py-1 rounded shrink-0">{t.viewOriginal}</span>
                             <div 
                                className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm flex-1 flex items-center justify-center overflow-hidden cursor-zoom-in group/orig relative"
                                onClick={() => setIsLightboxOpen(true)}
                             >
                                <img src={currentPattern.imageUrl} className="max-w-full max-h-full object-contain" alt="original" />
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/orig:opacity-100 transition-opacity pointer-events-none">
                                   <div className="bg-black/50 p-2 rounded-full text-white backdrop-blur-sm">
                                      <Maximize2 size={16} />
                                   </div>
                                </div>
                             </div>
                          </div>
                          <div className="flex flex-col gap-2 h-full">
                             <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase text-center bg-slate-200/50 dark:bg-slate-700/50 py-1 rounded shrink-0">{t.viewPattern}</span>
                             <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm flex-1 flex items-center justify-center overflow-hidden relative">
                                <PixelGrid 
                                   grid={currentPattern.grid} 
                                   showGridLines={false} 
                                   variant="plain" 
                                   className="w-full h-full object-contain"
                                />
                             </div>
                          </div>
                        </div>
                    </div>
                  )}
               </div>
            </div>

            <div className="lg:col-span-1">
              <BillOfMaterials 
                palette={currentPattern.palette} 
                grid={currentPattern.grid} 
                lang={lang} 
                onColorReplace={handleColorReplace}
                onSelectColor={setSelectedColor}
                selectedColor={selectedColor}
              />
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}

export default App;