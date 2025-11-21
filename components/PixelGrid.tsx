import React, { useEffect, useRef } from 'react';
import { GridData } from '../types';

interface PixelGridProps {
  grid: GridData;
  showGridLines?: boolean;
  scale?: number; // Pixel scaling factor for display
  onPixelClick?: (x: number, y: number, color: string) => void;
}

const PixelGrid: React.FC<PixelGridProps> = ({ 
  grid, 
  showGridLines = true, 
  scale = 10,
  onPixelClick
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

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Pixels
    pixels.forEach((hex, index) => {
      const x = (index % width) * scale;
      const y = Math.floor(index / width) * scale;

      if (hex === 'TRANSPARENT' || !hex) {
        // Draw checkerboard for transparent
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(x, y, scale, scale);
        ctx.fillStyle = '#e0e0e0';
        ctx.fillRect(x + scale/2, y, scale/2, scale/2);
        ctx.fillRect(x, y + scale/2, scale/2, scale/2);
      } else {
        ctx.fillStyle = hex;
        ctx.fillRect(x, y, scale, scale);
        
        // Simulated bead effect (highlight)
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.beginPath();
        ctx.arc(x + scale * 0.3, y + scale * 0.3, scale * 0.15, 0, Math.PI * 2);
        ctx.fill();
        
        // Simulated bead effect (shadow)
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        ctx.beginPath();
        ctx.arc(x + scale/2, y + scale/2, scale * 0.4, 0, Math.PI * 2);
        ctx.stroke();
      }
    });

    // Draw Grid Lines
    if (showGridLines) {
      ctx.strokeStyle = 'rgba(0,0,0,0.1)';
      ctx.lineWidth = 1;
      
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
    }

  }, [grid, showGridLines, scale]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onPixelClick || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / scale);
    const y = Math.floor((e.clientY - rect.top) / scale);
    const index = y * grid.width + x;

    if (index >= 0 && index < grid.pixels.length) {
      onPixelClick(x, y, grid.pixels[index]);
    }
  };

  return (
    <div className="overflow-auto flex justify-center bg-white rounded-lg shadow-inner p-4 border border-slate-200">
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