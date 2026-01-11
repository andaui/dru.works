'use client';

import { useEffect, useRef } from 'react';

interface HeroSectionProps {
  children: React.ReactNode;
  onHeightChange?: (height: number) => void;
}

export default function HeroSection({ children, onHeightChange }: HeroSectionProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const calculateHeight = () => {
      if (ref.current && onHeightChange) {
        const height = ref.current.offsetHeight;
        onHeightChange(height);
      }
    };

    calculateHeight();
    window.addEventListener('resize', calculateHeight);
    
    // Recalculate after a short delay to ensure content is rendered
    setTimeout(calculateHeight, 100);
    setTimeout(calculateHeight, 500);

    return () => {
      window.removeEventListener('resize', calculateHeight);
    };
  }, [onHeightChange, children]);

  return (
    <div ref={ref} className="relative w-full">
      {children}
    </div>
  );
}

