

export interface RgbColor {
  r: number;
  g: number;
  b: number;
}

export interface PaletteColor extends RgbColor {
  hex: string;
  name: string; // Added real bead name
  count: number;
  id: string;
}

export interface GridData {
  width: number;
  height: number;
  pixels: string[]; // Array of hex strings
}

export interface Pattern {
  id: string;
  name: string;
  timestamp: number;
  imageUrl?: string; // Original image
  grid: GridData;
  palette: PaletteColor[];
  beadSizeMm: number;
}

export type GenerationMode = 'text' | 'image' | 'history';

export type Language = 'zh' | 'en';

export type Theme = 'light' | 'dark' | 'system';

export interface HistoryItem extends Pattern {}

export interface LibraryItem {
  id: string;
  title: string;
  category: string;
  description: string;
  imageUrl: string;
  prompt?: string;
}