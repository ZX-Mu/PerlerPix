
import React, { useEffect, useRef } from 'react';
import { GridData } from '../types';

interface PixelGridProps {
  grid: GridData;
  showGridLines?: boolean;
  scale?: number; // Pixel scaling factor for display
  onPixelClick?: (x: number, y: number, color: string) => void;
  className?: string;
  variant?: 'default' | 'plain';
}

const PixelGrid: React.FC<PixelGridProps> = ({ 
  grid, 
  showGridLines = true, 
  scale = 10,
  onPixelClick,
  className = '',
  variant = 'default'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height, pixels } = grid;
    
    // Update canvas size
    canvas.width = width * scale;
    canvas.height = height * scale;

    // Clear canvas with a "board" color (very light gray usually)
    ctx.fillStyle = '#ffffff'; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Pixels
    pixels.forEach((hex, index) => {
      const x = (index % width) * scale;
      const y = Math.floor(index / width) * scale;
      const cx = x + scale / 2;
      const cy = y + scale / 2;
      const radius = scale * 0.4;

      if (hex === 'TRANSPARENT' || !hex) {
        // DRAW PEGBOARD STYLE: Empty circle (peg)
        ctx.strokeStyle = '#e2e8f0'; // light slate for the peg ring
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, radius * 0.6, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        // DRAW BEAD
        ctx.fillStyle = hex;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Bead Highlight (Plastic shine)
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.beginPath();
        ctx.arc(cx - radius * 0.3, cy - radius * 0.3, radius * 0.4, 0, Math.PI * 2);
        ctx.fill();
        
        // Bead Hole
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.beginPath();
        ctx.arc(cx, cy, radius * 0.3, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Draw Grid Lines (Optional, usually helpful for counting)
    if (showGridLines) {
      ctx.strokeStyle = 'rgba(0,0,0,0.06)';
      ctx.lineWidth = 0.5;
      
      // Verticals
      for (let i = 0; i <= width; i++) {
        ctx.beginPath();
        ctx.moveTo(i * scale, 0);
        ctx.lineTo(i * scale, height * scale);
        ctx.stroke();
      }
      
      // Horizontals
      for (let i = 0; i <= height; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * scale);
        ctx.lineTo(width * scale, i * scale);
        ctx.stroke();
      }
      
      // Major Grid Lines (every 10 beads, like standard perler boards)
      ctx.strokeStyle = 'rgba(0,0,0,0.2)';
      ctx.lineWidth = 1;
      for (let i = 0; i <= width; i+=10) {
        ctx.beginPath();
        ctx.moveTo(i * scale, 0);
        ctx.lineTo(i * scale, height * scale);
        ctx.stroke();
      }
      for (let i = 0; i <= height; i+=10) {
        ctx.beginPath();
        ctx.moveTo(0, i * scale);
        ctx.lineTo(width * scale, i * scale);
        ctx.stroke();
      }
    }

  }, [grid, showGridLines, scale]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onPixelClick || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    
    const x = Math.floor((e.clientX - rect.left) * scaleX / scale);
    const y = Math.floor((e.clientY - rect.top) * scaleY / scale);
    const index = y * grid.width + x;

    if (index >= 0 && index < grid.pixels.length) {
      onPixelClick(x, y, grid.pixels[index]);
    }
  };

  if (variant === 'plain') {
    return (
      <canvas 
        ref={canvasRef} 
        onClick={handleCanvasClick}
        className={`cursor-crosshair block mx-auto ${className}`}
        style={{ 
           maxWidth: '100%', 
           maxHeight: '100%',
           objectFit: 'contain'
        }}
      />
    );
  }

  return (
    <div className={`overflow-auto flex justify-center bg-white rounded-lg shadow-inner p-4 border border-slate-200 ${className}`}>
      <canvas 
        ref={canvasRef} 
        onClick={handleCanvasClick}
        className="cursor-crosshair"
        style={{ maxWidth: '100%' }}
      />
    </div>
  );
};

export default PixelGrid;
