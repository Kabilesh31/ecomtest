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
      const nextIndex = (currentIndex + 1) % images.length;

      if (carouselRef.current) {
        const width = carouselRef.current.clientWidth;
        carouselRef.current.scrollTo({
          left: nextIndex * width,
          behavior: "smooth",
        });
      }

      setCurrentIndex(nextIndex);
    }, 3000);

    return () => clearInterval(interval);
  }, [currentIndex, images]);

  useEffect(() => {
    const container = carouselRef.current;
    if (!container) return;

    const handleScroll = () => {
      const width = container.clientWidth;
      const index = Math.round(container.scrollLeft / width);
      setCurrentIndex(index);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  const selectImage = (index: number) => {
    if (carouselRef.current) {
      const width = carouselRef.current.clientWidth;
      carouselRef.current.scrollTo({
        left: index * width,
        behavior: "smooth",
      });
    }
    setCurrentIndex(index);
  };

  return (
    <div className="relative w-full h-full">
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

      {images.length > 1 && (
        <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.preventDefault();
                selectImage(index);
              }}
              className={`h-2 w-2 rounded-full transition-all ${
                currentIndex === index
                  ? "bg-black shadow-md scale-110"
                  : "bg-gray-500"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
