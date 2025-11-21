
import { GridData, PaletteColor, RgbColor } from '../types';
import { PERLER_PALETTE } from '../constants';

// Helper to convert Hex to RGB
const hexToRgb = (hex: string): RgbColor => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
};

// Improved Color Distance using Redmean approximation
// Matches human color perception better than Euclidean
const colorDistance = (c1: RgbColor, c2: RgbColor) => {
  const rmean = (c1.r + c2.r) / 2;
  const r = c1.r - c2.r;
  const g = c1.g - c2.g;
  const b = c1.b - c2.b;
  return Math.sqrt((((512 + rmean) * r * r) >> 8) + 4 * g * g + (((767 - rmean) * b * b) >> 8));
};

// Pre-calculate RGB for palette
const PALETTE_RGB = PERLER_PALETTE.map(p => ({
  ...p,
  rgb: hexToRgb(p.hex)
}));

// Find closest color in the palette
const findClosestPaletteColor = (r: number, g: number, b: number): string => {
  let closestHex = PALETTE_RGB[0].hex;
  let minDistance = Infinity;
  const target = { r, g, b };

  for (const color of PALETTE_RGB) {
    const dist = colorDistance(target, color.rgb);
    if (dist < minDistance) {
      minDistance = dist;
      closestHex = color.hex;
    }
  }
  return closestHex;
};

/**
 * Process image using Center-Weighted Voting.
 * 
 * Improvements:
 * 1. Center Weighting: Pixels near the center of the bead (grid cell) count more.
 *    This reduces "jitter" on edges where the grid doesn't align perfectly.
 * 2. Stricter Alpha: We ignore semi-transparent pixels (anti-aliasing) to prevent
 *    weird "halo" colors (e.g. pink edge on a red hat).
 */
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
      
      // Draw original image
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, w, h);
      const data = imageData.data;

      // Calculate dimensions
      const aspect = w / h;
      let targetW = gridSize;
      let targetH = gridSize;

      if (aspect > 1) {
        targetH = Math.round(gridSize / aspect);
      } else {
        targetW = Math.round(gridSize * aspect);
      }

      const blockW = w / targetW;
      const blockH = h / targetH;

      const pixels: string[] = [];
      const colorCounts: Record<string, number> = {};

      // Iterate through the target grid (the beads)
      for (let y = 0; y < targetH; y++) {
        for (let x = 0; x < targetW; x++) {
          // Calculate block bounds in source image
          const startX = x * blockW;
          const startY = y * blockH;
          const endX = Math.min(w, (x + 1) * blockW);
          const endY = Math.min(h, (y + 1) * blockH);
          
          const centerX = startX + blockW / 2;
          const centerY = startY + blockH / 2;

          // Weighted Voting System
          const votes: Record<string, number> = {};
          let maxScore = 0;
          let winnerHex = 'TRANSPARENT';

          // Optimization: Sample smartly based on block size
          // We don't need to check every single pixel if the image is 4K and beads are huge.
          // But we need enough density to catch details.
          const stepX = Math.max(1, Math.floor(blockW / 8));
          const stepY = Math.max(1, Math.floor(blockH / 8));

          for (let py = Math.floor(startY); py < endY; py += stepY) {
            for (let px = Math.floor(startX); px < endX; px += stepX) {
              const i = (py * w + px) * 4;
              const alpha = data[i + 3];

              // STRICT ALPHA THRESHOLD (180/255 approx 70%)
              // We ignore semi-transparent pixels (anti-aliasing edges) to avoid 
              // mixing foreground and background colors into a muddy 3rd color.
              if (alpha < 180) {
                 votes['TRANSPARENT'] = (votes['TRANSPARENT'] || 0) + 1; 
                 continue;
              }

              const r = data[i];
              const g = data[i + 1];
              const b = data[i + 2];
              
              // CENTER WEIGHTING
              // Calculate distance from the center of the bead
              const dx = (px - centerX) / (blockW / 2); 
              const dy = (py - centerY) / (blockH / 2);
              const distSq = dx*dx + dy*dy; // Squared distance (0 at center, ~1 at edge)
              
              // Gaussian-like weight: Drops off as we get further from center
              // This ensures the bead represents the "core" of the area, not the fringe.
              const weight = Math.exp(-distSq * 2); 

              const closest = findClosestPaletteColor(r, g, b);
              votes[closest] = (votes[closest] || 0) + weight;
            }
          }

          // Determine winner
          for (const [hex, score] of Object.entries(votes)) {
            if (score > maxScore) {
              maxScore = score;
              winnerHex = hex;
            }
          }

          if (winnerHex !== 'TRANSPARENT') {
            pixels.push(winnerHex);
            colorCounts[winnerHex] = (colorCounts[winnerHex] || 0) + 1;
          } else {
            pixels.push('TRANSPARENT');
          }
        }
      }

      // Build active palette
      const activePalette: PaletteColor[] = [];
      const sortedHexes = Object.keys(colorCounts).sort((a, b) => colorCounts[b] - colorCounts[a]);

      sortedHexes.forEach((hex, index) => {
        const originalRef = PERLER_PALETTE.find(p => p.hex === hex);
        const rgb = hexToRgb(hex);
        activePalette.push({
          ...rgb,
          hex,
          name: originalRef ? originalRef.name : 'Unknown',
          count: colorCounts[hex],
          id: `bead-${index}`
        });
      });

      resolve({
        grid: {
          width: targetW,
          height: targetH,
          pixels
        },
        palette: activePalette
      });
    };

    img.onerror = (err) => reject(err);
  });
};
