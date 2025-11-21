

import React, { useState, useRef } from 'react';
import Header from './components/Header';
import PixelGrid from './components/PixelGrid';
import BillOfMaterials from './components/BillOfMaterials';
import History from './components/History';
import { generatePatternImage } from './services/gemini';
import { processImageToGrid } from './services/imageProcessor';
import { Pattern, GenerationMode, HistoryItem, Language } from './types';
import { GRID_SIZES, TRANSLATIONS } from './constants';
import { Wand2, Image as ImageIcon, History as HistoryIcon, AlertCircle, Loader2, ZoomIn, X } from 'lucide-react';

function App() {
  const [lang, setLang] = useState<Language>('zh');
  const [mode, setMode] = useState<GenerationMode>('text');
  const [prompt, setPrompt] = useState('');
  const [gridSize, setGridSize] = useState(32);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPattern, setCurrentPattern] = useState<Pattern | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  
  const t = TRANSLATIONS[lang];
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to add to history
  const addToHistory = (pattern: Pattern) => {
    setHistory(prev => {
      // Avoid duplicates if editing same ID
      const filtered = prev.filter(p => p.id !== pattern.id);
      return [pattern, ...filtered];
    });
  };

  const handleGenerateText = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    setError(null);
    // Reset current pattern immediately to show loading state nicely if desired, 
    // or keep it until new one is ready. Showing loading state is clearer.
    setCurrentPattern(null); 
    
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 pb-20">
      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <Header lang={lang} setLang={setLang} />

      {/* Lightbox Overlay */}
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

      {/* Hero Section */}
      <div className="bg-gradient-to-b from-indigo-600 to-indigo-800 text-white py-16 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/pixel-weave.png')]"></div>
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 relative z-10">
          {t.heroTitle} <span className="text-yellow-300">{t.heroHighlight}</span>
        </h1>
        <p className="text-indigo-100 text-lg max-w-2xl mx-auto relative z-10">
          {t.heroDesc}
        </p>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20" id="generator">
        {/* Control Panel */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-1 mb-8">
          <div className="flex border-b border-slate-100">
            <button 
              onClick={() => setMode('text')}
              className={`flex-1 py-4 px-2 sm:px-6 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${mode === 'text' ? 'text-indigo-600 bg-indigo-50/50' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Wand2 size={18} />
              <span className="hidden sm:inline">{t.modeText}</span>
              <span className="sm:hidden">AI</span>
            </button>
            <button 
              onClick={() => setMode('image')}
              className={`flex-1 py-4 px-2 sm:px-6 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${mode === 'image' ? 'text-indigo-600 bg-indigo-50/50' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <ImageIcon size={18} />
              <span className="hidden sm:inline">{t.modeImage}</span>
              <span className="sm:hidden">Image</span>
            </button>
            <button 
              onClick={() => setMode('history')}
              className={`flex-1 py-4 px-2 sm:px-6 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${mode === 'history' ? 'text-indigo-600 bg-indigo-50/50' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <HistoryIcon size={18} />
              <span className="hidden sm:inline">{t.modeHistory}</span>
              <span className="sm:hidden">History</span>
            </button>
          </div>

          <div className="p-6 md:p-8">
            {/* Settings Row (Only for generators) */}
            {mode !== 'history' && (
              <div className="flex flex-wrap gap-6 mb-6 items-center">
                 <div className="flex items-center gap-3 w-full sm:w-auto">
                    <label className="text-sm font-bold text-slate-700 whitespace-nowrap">{t.gridLabel}</label>
                    <select 
                      value={gridSize}
                      onChange={(e) => setGridSize(Number(e.target.value))}
                      className="bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
                    >
                      {GRID_SIZES.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                 </div>
              </div>
            )}

            {/* Input Areas */}
            {mode === 'text' && (
              <div className="flex flex-col sm:flex-row gap-4">
                <input 
                  type="text" 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={t.promptPlaceholder}
                  className="flex-1 p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-800 placeholder-slate-400 shadow-sm"
                  onKeyDown={(e) => e.key === 'Enter' && handleGenerateText()}
                />
                <button 
                  onClick={handleGenerateText}
                  disabled={isLoading || !prompt.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all flex items-center gap-2 min-w-[140px] justify-center"
                >
                  {isLoading ? <Loader2 className="animate-spin" /> : <Wand2 size={20} />}
                  {t.generateBtn}
                </button>
              </div>
            )}

            {mode === 'image' && (
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-12 text-center hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleImageUpload}
                />
                <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  {isLoading ? <Loader2 className="animate-spin" /> : <ImageIcon size={32} />}
                </div>
                <h3 className="text-lg font-bold text-slate-700">{t.uploadTitle}</h3>
                <p className="text-slate-500 mt-1">{t.uploadDesc}</p>
              </div>
            )}

            {mode === 'history' && (
              <History history={history} onSelect={handleHistorySelect} lang={lang} />
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r mb-8 flex items-center gap-3 text-red-700">
             <AlertCircle size={20} />
             <p>{error}</p>
          </div>
        )}

        {/* Results Area */}
        {isLoading ? (
          // Loading Skeleton State
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
               <div className="h-8 w-1/3 bg-slate-200 rounded animate-pulse"></div>
               <div className="aspect-square w-full bg-slate-100 rounded-xl relative overflow-hidden border border-slate-200">
                  {/* Shimmer Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent w-full h-full -translate-x-full animate-[shimmer_1.5s_infinite]"></div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-3">
                      <Loader2 className="animate-spin text-indigo-400" size={48} />
                      <p className="font-medium text-indigo-900/50 animate-pulse tracking-wide">{t.loading}</p>
                  </div>
               </div>
               <div className="h-24 bg-slate-100 rounded-xl border border-slate-200 animate-pulse"></div>
            </div>
            <div className="lg:col-span-1">
               <div className="h-full bg-white rounded-xl border border-slate-200 p-6 space-y-4">
                  <div className="h-6 w-1/2 bg-slate-200 rounded animate-pulse"></div>
                  <div className="space-y-2 mt-8">
                     {[1,2,3,4,5,6,7,8].map(i => (
                       <div key={i} className="h-8 bg-slate-100 rounded animate-pulse" style={{ animationDelay: `${i * 100}ms` }}></div>
                     ))}
                  </div>
               </div>
            </div>
          </div>
        ) : currentPattern ? (
          // Results
          <div key={currentPattern.id} className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-[fadeIn_0.6s_ease-out]">
            {/* Left: Preview */}
            <div className="lg:col-span-2 space-y-6">
               <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-slate-900">{t.previewTitle}</h2>
                  <div className="flex gap-2">
                    <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded text-sm font-mono">
                      {currentPattern.grid.width}x{currentPattern.grid.height}
                    </span>
                  </div>
               </div>
               
               <PixelGrid grid={currentPattern.grid} />
               
               {/* Source Image Block - Zoomable */}
               <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div 
                      className="relative group cursor-zoom-in h-16 w-16"
                      onClick={() => setIsLightboxOpen(true)}
                    >
                      <img 
                        src={currentPattern.imageUrl} 
                        className="h-full w-full rounded border border-slate-200 object-contain bg-slate-50" 
                        alt="source" 
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded flex items-center justify-center">
                          <ZoomIn size={20} className="text-white opacity-0 group-hover:opacity-100 drop-shadow-md transition-opacity" />
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <h3 className="font-bold text-sm text-slate-500 uppercase tracking-wider mb-0.5">{t.sourceTitle}</h3>
                      <p className="text-sm text-slate-600 italic line-clamp-1 max-w-[200px]" title={currentPattern.name}>
                        "{currentPattern.name}"
                      </p>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => setIsLightboxOpen(true)}
                    className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-full transition-colors"
                  >
                    <ZoomIn size={14} />
                    {t.zoom}
                  </button>
               </div>
            </div>

            {/* Right: BOM */}
            <div className="lg:col-span-1">
              <BillOfMaterials palette={currentPattern.palette} grid={currentPattern.grid} lang={lang} />
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}

export default App;