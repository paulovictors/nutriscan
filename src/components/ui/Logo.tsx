import React from 'react';
import { ScanLine, Leaf } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Logo({ size = 'md', className = '' }: LogoProps) {
  const sizes = {
    sm: { icon: 20, text: 'text-lg' },
    md: { icon: 32, text: 'text-2xl' },
    lg: { icon: 48, text: 'text-4xl' },
  };

  const currentSize = sizes[size];

  return (
    <div className={`flex items-center gap-2 font-bold text-gray-900 ${className}`}>
      <div className="relative flex items-center justify-center text-emerald-600">
        <ScanLine size={currentSize.icon} strokeWidth={2.5} />
        <Leaf 
          size={currentSize.icon * 0.5} 
          className="absolute" 
          fill="currentColor" 
          strokeWidth={0}
        />
      </div>
      <span className={`${currentSize.text} tracking-tight`}>
        Scan<span className="text-emerald-600">IA</span>
      </span>
    </div>
  );
}
