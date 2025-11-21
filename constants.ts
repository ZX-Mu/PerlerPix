

import { LibraryItem } from './types';

export const BEAD_SIZE_MM = 2.6; // Mini beads standard

export const GRID_SIZES = [
  { label: 'Small (16x16)', value: 16 },
  { label: 'Medium (32x32)', value: 32 },
  { label: 'Large (48x48)', value: 48 },
  { label: 'Extra Large (64x64)', value: 64 },
  { label: 'Detailed (80x80)', value: 80 },
];

// A realistic palette based on popular Perler/Hama/Artkal colors
// This improves accuracy by mapping to real physical colors
export const PERLER_PALETTE = [
  { hex: '#000000', name: 'Black' },
  { hex: '#FFFFFF', name: 'White' },
  { hex: '#888888', name: 'Grey' },
  { hex: '#C0C0C0', name: 'Light Grey' },
  { hex: '#555555', name: 'Dark Grey' },
  { hex: '#E4E4E4', name: 'Clear' },
  { hex: '#A05F35', name: 'Brown' },
  { hex: '#D4A467', name: 'Light Brown' },
  { hex: '#683F23', name: 'Dark Brown' },
  { hex: '#CFA876', name: 'Tan' },
  { hex: '#F0E68C', name: 'Sand' },
  { hex: '#ECCDB1', name: 'Flesh' },
  { hex: '#FFDAB9', name: 'Peach' },
  { hex: '#FF0000', name: 'Red' },
  { hex: '#8B0000', name: 'Dark Red' },
  { hex: '#FA8072', name: 'Salmon' },
  { hex: '#FF69B4', name: 'Hot Pink' },
  { hex: '#FFC0CB', name: 'Pink' },
  { hex: '#F7A8B8', name: 'Light Pink' },
  { hex: '#E05395', name: 'Raspberry' },
  { hex: '#800080', name: 'Purple' },
  { hex: '#DDA0DD', name: 'Plum' },
  { hex: '#9370DB', name: 'Pastel Lavender' },
  { hex: '#4B0082', name: 'Indigo' },
  { hex: '#0000FF', name: 'Blue' },
  { hex: '#00008B', name: 'Dark Blue' },
  { hex: '#87CEEB', name: 'Light Blue' },
  { hex: '#4169E1', name: 'Royal Blue' },
  { hex: '#00FFFF', name: 'Cyan' },
  { hex: '#40E0D0', name: 'Turquoise' },
  { hex: '#008080', name: 'Teal' },
  { hex: '#008000', name: 'Green' },
  { hex: '#006400', name: 'Dark Green' },
  { hex: '#90EE90', name: 'Light Green' },
  { hex: '#32CD32', name: 'Lime Green' },
  { hex: '#556B2F', name: 'Olive' },
  { hex: '#FFFF00', name: 'Yellow' },
  { hex: '#F0E632', name: 'Pastel Yellow' },
  { hex: '#FFA500', name: 'Orange' },
  { hex: '#FF8C00', name: 'Dark Orange' },
  { hex: '#FFA07A', name: 'Light Salmon' },
  { hex: '#F5F5DC', name: 'Cream' },
  { hex: '#E6E6FA', name: 'Lavender' },
  { hex: '#98FB98', name: 'Pale Green' },
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