"use client";

import SpotlightCarousel from "./SpotlightCarousel";

interface MediaData {
  url: string;
  alt: string;
  text?: string;
  type: 'image' | 'video';
}

interface SpotlightCarouselWrapperProps {
  items: MediaData[];
}

export default function SpotlightCarouselWrapper({ items }: SpotlightCarouselWrapperProps) {
  if (items.length === 0) {
    return null;
  }
  return <SpotlightCarousel items={items} />;
}
