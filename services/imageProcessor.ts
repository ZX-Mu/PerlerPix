
import { GridData, PaletteColor, RgbColor } from '../types';
import { PERLER_PALETTE } from '../constants';

// --- Helper: Color Space Conversions ---

const rgbToLab = (r: number, g: number, b: number) => {
  let r_ = r / 255, g_ = g / 255, b_ = b / 255;

  if (r_ > 0.04045) r_ = Math.pow((r_ + 0.055) / 1.055, 2.4);
  else r_ = r_ / 12.92;
  if (g_ > 0.04045) g_ = Math.pow((g_ + 0.055) / 1.055, 2.4);
  else g_ = g_ / 12.92;
  if (b_ > 0.04045) b_ = Math.pow((b_ + 0.055) / 1.055, 2.4);
  else b_ = b_ / 12.92;

  r_ *= 100; g_ *= 100; b_ *= 100;

  const x = r_ * 0.4124 + g_ * 0.3576 + b_ * 0.1805;
  const y = r_ * 0.2126 + g_ * 0.7152 + b_ * 0.0722;
  const z = r_ * 0.0193 + g_ * 0.1192 + b_ * 0.9505;

  let x_ = x / 95.047, y_ = y / 100.000, z_ = z / 108.883;

  if (x_ > 0.008856) x_ = Math.pow(x_, 1.0/3);
  else x_ = (7.787 * x_) + (16 / 116);
  if (y_ > 0.008856) y_ = Math.pow(y_, 1.0/3);
  else y_ = (7.787 * y_) + (16 / 116);
  if (z_ > 0.008856) z_ = Math.pow(z_, 1.0/3);
  else z_ = (7.787 * z_) + (16 / 116);

  const L = (116 * y_) - 16;
  const a = 500 * (x_ - y_);
  const beta = 200 * (y_ - z_);

  return { L, a, b: beta };
};

const hexToRgb = (hex: string): RgbColor => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
};

// Pre-calculate Palette in LAB
const PALETTE_LAB = PERLER_PALETTE.map(p => {
  const rgb = hexToRgb(p.hex);
  const lab = rgbToLab(rgb.r, rgb.g, rgb.b);
  return { ...p, rgb, lab };
});

// --- Core Logic: Advanced Color Matching ---

const findBestBead = (r: number, g: number, b: number): string => {
  const targetLab = rgbToLab(r, g, b);
  
  let bestHex = PALETTE_LAB[0].hex;
  let minScore = Infinity;

  for (const bead of PALETTE_LAB) {
    // Standard CIELAB Euclidean Distance
    const dL = targetLab.L - bead.lab.L;
    const da = targetLab.a - bead.lab.a;
    const db = targetLab.b - bead.lab.b;
    
    const dist = (dL * dL) + (da * da) + (db * db);

    if (dist < minScore) {
      minScore = dist;
      bestHex = bead.hex;
    }
  }
  
  return bestHex;
};

// V15: Ultra Strict Outline. 
// Threshold < 35 means only near-pitch-black pixels are outlines.
// Dark Brown (L~30-40) might still trigger, so we check if it's ACTUALLY black.
const isOutlineColor = (hex: string): boolean => {
  const rgb = hexToRgb(hex);
  const y = (rgb.r * 0.299 + rgb.g * 0.587 + rgb.b * 0.114);
  return y < 35; 
};

const isFeatureColor = (hex: string): boolean => {
   const p = PERLER_PALETTE.find(x => x.hex === hex);
   if (!p) return false;
   const name = p.name.toLowerCase();
   if (name.includes('pink') || name.includes('red') || name.includes('rose') || name.includes('bubblegum')) return true;
   if (name === 'white') return true; // Eye highlights
   // Include Black as feature to protect small eyes/details from being averaged out
   if (name === 'black') return true; 
   return false;
}

// --- Image Processing Pipeline ---

export const processImageToGrid = (
  imageUrl: string,
  gridSize: number
): Promise<{ grid: GridData; palette: PaletteColor[] }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imageUrl;
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      
      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      const w = img.width;
      const h = img.height;
      canvas.width = w;
      canvas.height = h;
      
      // No contrast boost to prevent crushing shadows into black outlines
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, w, h);
      const data = imageData.data;
      
      const aspect = w / h;
      let targetW = gridSize;
      let targetH = gridSize;
      if (aspect > 1) targetH = Math.round(gridSize / aspect);
      else targetW = Math.round(gridSize * aspect);

      const blockW = w / targetW;
      const blockH = h / targetH;

      const rawPixels: string[] = [];

      // Background Detection
      const getPixelHex = (x: number, y: number) => findBestBead(data[(y*w+x)*4], data[(y*w+x)*4+1], data[(y*w+x)*4+2]);
      const corners = [getPixelHex(0,0), getPixelHex(w-1,0), getPixelHex(0,h-1), getPixelHex(w-1,h-1)];
      const bgCounts: Record<string,number> = {};
      corners.forEach(c => bgCounts[c] = (bgCounts[c]||0)+1);
      const bgColor = Object.keys(bgCounts).reduce((a, b) => bgCounts[a] > bgCounts[b] ? a : b);

      // 4. Downsampling
      for (let y = 0; y < targetH; y++) {
        for (let x = 0; x < targetW; x++) {
          const startX = Math.floor(x * blockW);
          const startY = Math.floor(y * blockH);
          const endX = Math.floor(Math.min(w, (x + 1) * blockW));
          const endY = Math.floor(Math.min(h, (y + 1) * blockH));
          
          const colorCounts: Record<string, number> = {};
          let totalSamples = 0;
          let transparentSamples = 0;
          let outlineSamples = 0;

          const padX = Math.max(0, Math.floor((endX - startX) * 0.2));
          const padY = Math.max(0, Math.floor((endY - startY) * 0.2));

          for (let py = startY + padX; py < endY - padY; py++) {
            for (let px = startX + padX; px < endX - padX; px++) {
              const i = (py * w + px) * 4;
              const alpha = data[i+3];
              if (alpha < 128) {
                transparentSamples++;
              } else {
                const bead = findBestBead(data[i], data[i+1], data[i+2]);
                colorCounts[bead] = (colorCounts[bead] || 0) + 1;
                if (isOutlineColor(bead)) outlineSamples++;
              }
              totalSamples++;
            }
          }

          if (transparentSamples > totalSamples * 0.6) {
             rawPixels.push('TRANSPARENT');
             continue;
          }

          const validSamples = totalSamples - transparentSamples || 1;

          // Priority 1: Features (Pink Ears, Black Eyes)
          let featureWinner: string | null = null;
          let maxFeatureCount = 0;
          for (const [hex, count] of Object.entries(colorCounts)) {
             if (isFeatureColor(hex) && hex !== bgColor) {
                // Lower threshold (15%) to catch small details like eyes
                if (count / validSamples > 0.15 && count > maxFeatureCount) {
                   maxFeatureCount = count;
                   featureWinner = hex;
                }
             }
          }
          if (featureWinner) {
             rawPixels.push(featureWinner);
             continue;
          }

          // Priority 2: Outlines (Black)
          // Strict Check: Must be > 20% and really dark
          if ((outlineSamples / validSamples > 0.20) && bgColor !== '#000000') {
             rawPixels.push('#000000'); 
             continue;
          }

          // Priority 3: Dominant Color
          let winner = 'TRANSPARENT';
          let maxVotes = 0;
          for (const [hex, count] of Object.entries(colorCounts)) {
            if (count > maxVotes) {
              maxVotes = count;
              winner = hex;
            }
          }
          if (winner === 'TRANSPARENT' && Object.keys(colorCounts).length > 0) winner = Object.keys(colorCounts)[0];
          
          rawPixels.push(winner);
        }
      }

      // 5. Topology Protection (Anti-Leak)
      // We create a "Safety Mask" by dilating the dark pixels to close gaps.
      // Then we calculate background on THIS safe mask, but apply it to the original.
      const safetyGrid = sealOutlines(rawPixels, targetW, targetH, true); // aggressive seal
      const isBg = calculateBackgroundMap(safetyGrid, targetW, targetH, bgColor);

      const finalPixels = rawPixels.map((p, i) => {
         if (isBg[i]) return 'TRANSPARENT';
         // If not background, but was transparent, it means it's inside (belly)
         if (p === 'TRANSPARENT' || p === bgColor) return '#FFFFFF'; 
         return p;
      });
      
      // 6. Despeckle
      const cleaned = despeckleGrid(finalPixels, targetW, targetH);

      const paletteCounts: Record<string, number> = {};
      cleaned.forEach(hex => {
        if (hex !== 'TRANSPARENT') paletteCounts[hex] = (paletteCounts[hex] || 0) + 1;
      });

      const activePalette: PaletteColor[] = [];
      Object.entries(paletteCounts)
        .sort(([,a], [,b]) => b - a)
        .forEach(([hex, count], idx) => {
           const ref = PERLER_PALETTE.find(p => p.hex === hex);
           const rgb = hexToRgb(hex);
           activePalette.push({
             ...rgb,
             hex,
             name: ref?.name || 'Unknown',
             count,
             id: `bead-${idx}`
           });
        });

      resolve({
        grid: { width: targetW, height: targetH, pixels: cleaned },
        palette: activePalette
      });
    };
    img.onerror = (e) => reject(e);
  });
};

// --- Topology Helpers ---

const sealOutlines = (pixels: string[], w: number, h: number, aggressive: boolean = false): string[] => {
  const res = [...pixels];
  const isOut = (i: number) => i >= 0 && i < pixels.length && isOutlineColor(pixels[i]);
  
  // Aggressive mode: Dilate all black pixels to close small gaps
  if (aggressive) {
    for (let i = 0; i < pixels.length; i++) {
       if (isOut(i)) {
          const neighbors = [i+1, i-1, i+w, i-w, i+w+1, i+w-1, i-w+1, i-w-1];
          neighbors.forEach(n => {
             if (n>=0 && n<pixels.length && pixels[n] !== '#000000') res[n] = '#000000';
          });
       }
    }
  } else {
    // Standard diagonal seal
    for (let y = 0; y < h - 1; y++) {
      for (let x = 0; x < w - 1; x++) {
        const i = y * w + x;
        const right = i + 1;
        const bottom = i + w;
        const bottomRight = i + w + 1;
        if (isOut(i) && isOut(bottomRight) && !isOut(right) && !isOut(bottom)) res[right] = '#000000';
        if (isOut(right) && isOut(bottom) && !isOut(i) && !isOut(bottomRight)) res[i] = '#000000';
      }
    }
  }
  return res;
};

const calculateBackgroundMap = (pixels: string[], w: number, h: number, bgColor: string): boolean[] => {
  const isBg = new Array(pixels.length).fill(false);
  const queue: number[] = [];
  
  const visit = (i: number) => {
     if (i < 0 || i >= pixels.length) return;
     if (isBg[i]) return;
     // If it's transparent or the background color, it's traversable
     // BUT NOT if it's a feature/outline (which acts as a wall)
     if (isOutlineColor(pixels[i])) return; // Wall
     
     isBg[i] = true;
     queue.push(i);
  };

  // Start from borders
  for(let x=0; x<w; x++) { visit(x); visit((h-1)*w+x); }
  for(let y=1; y<h-1; y++) { visit(y*w); visit(y*w + w - 1); }

  let head = 0;
  while(head < queue.length) {
    const idx = queue[head++];
    const n = [idx-1, idx+1, idx-w, idx+w];
    n.forEach(visit);
  }
  return isBg;
};

const despeckleGrid = (pixels: string[], w: number, h: number): string[] => {
  const res = [...pixels];
  for(let y=1; y<h-1; y++) {
      for(let x=1; x<w-1; x++) {
          const i = y*w+x;
          const c = res[i];
          if(c === 'TRANSPARENT') continue;
          if(isOutlineColor(c) || isFeatureColor(c)) continue; // Don't remove features

          const n = [
              res[y*w + x-1], res[y*w + x+1],
              res[(y-1)*w + x], res[(y+1)*w + x]
          ].filter(x => x !== 'TRANSPARENT');
          
          if(n.length === 0) continue;
          
          const isOrphan = n.every(neighbor => neighbor !== c);
          if(isOrphan) {
             const counts: Record<string,number> = {};
             let maxC = n[0];
             let maxV = 0;
             n.forEach(x => {
                 counts[x] = (counts[x]||0)+1;
                 if(counts[x]>maxV) { maxV=counts[x]; maxC=x; }
             });
             if (!isOutlineColor(maxC)) res[i] = maxC;
          }
      }
  }
  return res;
};
