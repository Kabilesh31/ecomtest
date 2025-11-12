"use client";

import { useRef, useEffect, useState } from "react";

interface ImageCarouselProps {
  images: string[];
}

export function ImageCarousel({ images }: ImageCarouselProps) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!images || images.length <= 1) return;

    const interval = setInterval(() => {
      if (carouselRef.current) {
        // Calculate next index
        const nextIndex = (currentIndex + 1) % images.length;

        // Scroll to next image
        const width = carouselRef.current.clientWidth;
        carouselRef.current.scrollTo({
          left: nextIndex * width,
          behavior: "smooth",
        });

        setCurrentIndex(nextIndex);
      }
    }, 3000); // Scroll every 3 seconds

    return () => clearInterval(interval);
  }, [currentIndex, images]);

  return (
    <div
      ref={carouselRef}
      className="flex h-full overflow-x-hidden scroll-smooth snap-x snap-mandatory"
    >
      {images.map((img, idx) => (
        <img
          key={idx}
          src={img}
          alt={`product-${idx}`}
          className="w-full h-full object-contain flex-shrink-0 snap-center"
          onError={(e) => (e.currentTarget.src = "/placeholder.svg")}
        />
      ))}
    </div>
  );
}
