

import { LibraryItem } from './types';

export const BEAD_SIZE_MM = 2.6; // Mini beads standard

export const GRID_SIZES = [
  { value: 29, key: 'grid29' },
  { value: 32, key: 'grid32' },
  { value: 48, key: 'grid48' },
  { value: 50, key: 'grid50' },
  { value: 64, key: 'grid64' },
  { value: 80, key: 'grid80' },
];

// V12 Expert Palette
// A comprehensive palette based on Perler/Artkal systems for professional shading.
export const PERLER_PALETTE = [
  // Grayscale / Neutrals
  { hex: '#000000', name: 'Black' },
  { hex: '#FFFFFF', name: 'White' },
  { hex: '#888888', name: 'Grey' },
  { hex: '#555555', name: 'Dark Grey' }, // Vital for outlines
  { hex: '#C0C0C0', name: 'Light Grey' },
  { hex: '#E4E4E4', name: 'Clear' }, // Transparent placeholder

  // Browns / Skin Tones (Crucial for Animals)
  { hex: '#683F23', name: 'Dark Brown' },
  { hex: '#A05F35', name: 'Brown' },
  { hex: '#D4A467', name: 'Light Brown' },
  { hex: '#CFA876', name: 'Tan' },
  { hex: '#F0E68C', name: 'Sand' },
  { hex: '#F5F5DC', name: 'Cream' }, // Chest/Belly
  { hex: '#DEB887', name: 'Burlywood' },
  { hex: '#ECCDB1', name: 'Flesh' },
  { hex: '#FFDAB9', name: 'Peach' },
  { hex: '#E3963E', name: 'Butterscotch' }, // Golden Retrievers/Corgis
  { hex: '#D2B48C', name: 'Toasted Marshmallow' }, // Transition color
  { hex: '#F5DEB3', name: 'Wheat' },
  { hex: '#8B4513', name: 'Saddle Brown' },
  { hex: '#B7410E', name: 'Rust' }, // Deep shadows

  // Reds / Pinks
  { hex: '#FF0000', name: 'Red' },
  { hex: '#8B0000', name: 'Dark Red' },
  { hex: '#FA8072', name: 'Salmon' },
  { hex: '#FFC0CB', name: 'Pink' },
  { hex: '#FF69B4', name: 'Hot Pink' },
  { hex: '#E05395', name: 'Raspberry' },
  { hex: '#FFB7C5', name: 'Bubblegum' }, // Ears inner color
  { hex: '#F7A8B8', name: 'Light Pink' },

  // Oranges / Yellows
  { hex: '#FFA500', name: 'Orange' },
  { hex: '#FF8C00', name: 'Dark Orange' }, // Standard Corgi
  { hex: '#F9A602', name: 'Cheddar' }, // Vibrant Orange
  { hex: '#FFA07A', name: 'Light Salmon' },
  { hex: '#FFFF00', name: 'Yellow' },
  { hex: '#F0E632', name: 'Pastel Yellow' },
  { hex: '#FFD700', name: 'Gold' },

  // Greens
  { hex: '#008000', name: 'Green' },
  { hex: '#006400', name: 'Dark Green' },
  { hex: '#32CD32', name: 'Lime Green' },
  { hex: '#90EE90', name: 'Light Green' },
  { hex: '#98FB98', name: 'Pale Green' },
  { hex: '#556B2F', name: 'Olive' },
  { hex: '#808000', name: 'Olive Drab' },
  { hex: '#ADFF2F', name: 'Green Yellow' },
  { hex: '#7CFC00', name: 'Lawn Green' },

  // Blues / Teals
  { hex: '#0000FF', name: 'Blue' },
  { hex: '#00008B', name: 'Dark Blue' },
  { hex: '#4169E1', name: 'Royal Blue' },
  { hex: '#87CEEB', name: 'Light Blue' },
  { hex: '#00FFFF', name: 'Cyan' },
  { hex: '#40E0D0', name: 'Turquoise' },
  { hex: '#008080', name: 'Teal' },
  { hex: '#2F4F4F', name: 'Dark Slate Grey' },
  { hex: '#708090', name: 'Slate Grey' },

  // Purples
  { hex: '#800080', name: 'Purple' },
  { hex: '#4B0082', name: 'Indigo' },
  { hex: '#DDA0DD', name: 'Plum' },
  { hex: '#9370DB', name: 'Pastel Lavender' },
  { hex: '#E6E6FA', name: 'Lavender' },
];

export const TRANSLATIONS = {
  en: {
    title: "PerlerPix",
    subtitle: "Pixel Art Generator",
    home: "Home",
    create: "Create",
    history: "History",
    heroTitle: "Turn Ideas into",
    heroHighlight: "Beads",
    heroDesc: "Create stunning 2.6mm Perler bead patterns from text or images instantly using AI.",
    modeText: "AI Text to Pattern",
    modeImage: "Upload Image",
    modeHistory: "My History",
    gridLabel: "Grid Size:",
    promptPlaceholder: "E.g., A cute pixel art corgi, a red strawberry, 8-bit superhero...",
    generateBtn: "Generate",
    uploadTitle: "Click to upload an image",
    uploadDesc: "Supports JPG, PNG. We will auto-pixelate it.",
    historyEmpty: "No patterns generated yet. Start creating!",
    previewTitle: "Pattern Preview",
    sourceTitle: "Original Source",
    bomTitle: "Materials List",
    finishedSize: "Finished Size",
    exportCsv: "Export CSV",
    loading: "Processing...",
    errorImg: "Failed to process image.",
    errorGen: "Failed to generate pattern.",
    useTemplate: "Load",
    zoom: "Zoom",
    grid29: "Standard Small (29x29)",
    grid32: "Medium (32x32)",
    grid48: "Large (48x48)",
    grid50: "Standard Plate (50x50)",
    grid64: "Extra Large (64x64)",
    grid80: "Detailed (80x80)",
    viewPattern: "Pattern",
    viewOriginal: "Original",
    viewCompare: "Compare",
    compareTip: "Side-by-side comparison",
  },
  zh: {
    title: "PerlerPix",
    subtitle: "拼豆图纸生成器",
    home: "首页",
    create: "创作",
    history: "历史记录",
    heroTitle: "让创意变成",
    heroHighlight: "拼豆",
    heroDesc: "使用 AI 即时将文字或图片转换为 2.6mm 拼豆图纸，支持精准色彩匹配。",
    modeText: "AI 文字生成",
    modeImage: "上传图片",
    modeHistory: "生成记录",
    gridLabel: "图纸尺寸:",
    promptPlaceholder: "例如：一只可爱的像素柯基，红色的草莓，8位风格超级英雄...",
    generateBtn: "生成图纸",
    uploadTitle: "点击上传图片",
    uploadDesc: "支持 JPG, PNG。自动转换为像素画。",
    historyEmpty: "暂无生成记录。快去创作吧！",
    previewTitle: "图纸预览",
    sourceTitle: "原始参考",
    bomTitle: "材料清单",
    finishedSize: "成品尺寸",
    exportCsv: "导出 CSV",
    loading: "正在处理...",
    errorImg: "图片处理失败",
    errorGen: "图纸生成失败",
    useTemplate: "使用",
    zoom: "查看大图",
    grid29: "标准小板 (29x29)",
    grid32: "中号 (32x32)",
    grid48: "大号 (48x48)",
    grid50: "标准大板 (50x50)",
    grid64: "标准大板 (64x64)",
    grid80: "精细 (80x80)",
    viewPattern: "图纸",
    viewOriginal: "原图",
    viewCompare: "对比",
    compareTip: "左右对比查看",
  }
};

export const SAMPLE_LIBRARY: LibraryItem[] = [
  {
    id: '1',
    title: 'Pixel Heart',
    category: 'Icon',
    description: 'A simple classic heart shape.',
    imageUrl: 'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?auto=format&fit=crop&w=400&q=80',
    prompt: 'Simple pixel art heart icon, red color'
  },
  {
    id: '2',
    title: 'Space Rocket',
    category: 'Space',
    description: 'Blast off with this retro rocket.',
    imageUrl: 'https://images.unsplash.com/photo-1517976487492-5750f3195933?auto=format&fit=crop&w=400&q=80',
    prompt: 'Pixel art space rocket taking off'
  },
  {
    id: '3',
    title: 'Cool Cat',
    category: 'Animals',
    description: 'A cute cat face for pet lovers.',
    imageUrl: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=400&q=80',
    prompt: 'Pixel art cat face'
  },
  {
    id: '4',
    title: 'Red Apple',
    category: 'Food',
    description: 'Healthy and shiny red apple.',
    imageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=400&q=80',
    prompt: 'Pixel art red apple'
  }
];