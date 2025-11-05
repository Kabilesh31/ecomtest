"use client";

import { useEffect, useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

interface HeroItem {
  _id: string;
  type: "image" | "video";
  media: string;  // ✅ changed from src → media
  title: string;
  subtitle?: string;
  description: string;
}

export function HeroSection() {
  const [heroContent, setHeroContent] = useState<HeroItem[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [bgAttachment, setBgAttachment] = useState<"fixed" | "scroll">("scroll");

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
  const MEDIA_URL = process.env.NEXT_PUBLIC_MEDIA_URL || "http://localhost:5000";

  // ✅ Fetch hero data
  const fetchHeroData = async () => {
    try {
      const res = await fetch(`${API_URL}/hero`);
      if (!res.ok) throw new Error("Failed to fetch hero slides");
      const data = await res.json();
      console.log("✅ Hero data fetched:", data);
      setHeroContent(data);
    } catch (error) {
      console.error("❌ Hero fetch error:", error);
    }
  };

  useEffect(() => {
    fetchHeroData();
  }, []);

  // ✅ Adjust background scroll/fixed
  useEffect(() => {
    const handleResize = () => {
      setBgAttachment(window.innerWidth > 768 ? "fixed" : "scroll");
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ✅ Auto slide every 5s
  useEffect(() => {
    if (!heroContent.length) return;
    const interval = setInterval(() => goToNextSlide(), 5000);
    return () => clearInterval(interval);
  }, [currentSlide, heroContent]);

  const goToNextSlide = () => {
    if (isTransitioning || !heroContent.length) return;
    setIsTransitioning(true);
    const nextIndex = (currentSlide + 1) % heroContent.length;
    setTimeout(() => {
      setCurrentSlide(nextIndex);
      setIsTransitioning(false);
    }, 1000);
  };

  const goToPrevSlide = () => {
    if (isTransitioning || !heroContent.length) return;
    setIsTransitioning(true);
    const prevIndex = (currentSlide - 1 + heroContent.length) % heroContent.length;
    setTimeout(() => {
      setCurrentSlide(prevIndex);
      setIsTransitioning(false);
    }, 1000);
  };

  if (!heroContent.length) {
    return (
      <section className="flex justify-center items-center h-screen text-white bg-black">
        <p>Loading ...</p>
      </section>
    );
  }

  const currentContent = heroContent[currentSlide];

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* 🔹 Background Layer */}
      <div className="absolute inset-0">
        {heroContent.map((content, index) => {
          const isActive = index === currentSlide;
          const isNext = index === (currentSlide + 1) % heroContent.length;

          let translateY = "100%";
          if (isActive && !isTransitioning) translateY = "0%";
          else if (isActive && isTransitioning) translateY = "-100%";
          else if (isNext && isTransitioning) translateY = "0%";

          return (
            <div
              key={content._id}
              className="absolute inset-0 transition-transform duration-1000 ease-in-out"
              style={{
                transform: `translateY(${translateY})`,
                zIndex: isActive || isNext ? 2 : 1,
                backgroundAttachment: bgAttachment,
              }}
            >
              {content.type === "video" ? (
                <video
                  src={content.media}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error("🎥 Video load error", content.media);
                    (e.target as HTMLVideoElement).style.display = "none";
                  }}
                />
              ) : (
                <div
  className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat transition-opacity duration-1000"
  style={{
    backgroundImage: `url(${content.media})`,
    opacity: 1,
  }}
></div>
              )}
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/60" />
            </div>
          );
        })}
      </div>

      {/* 🔹 Slide Controls */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-4">
        <button
          onClick={goToPrevSlide}
          className="bg-white/10 rounded-full p-2 border border-white/20 text-white hover:bg-white/20 transition"
        >
          <ChevronUp className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center gap-2 text-white/80 text-sm">
          <span>{String(currentSlide + 1).padStart(2, "0")}</span>
          <div className="w-px h-12 bg-white/30"></div>
          <span>{String(heroContent.length).padStart(2, "0")}</span>
        </div>

        <button
          onClick={goToNextSlide}
          className="bg-white/10 rounded-full p-2 border border-white/20 text-white hover:bg-white/20 transition"
        >
          <ChevronDown className="w-5 h-5" />
        </button>
      </div>

      {/* 🔹 Text Layer */}
      <div className="relative z-10 container mx-auto px-4 text-center text-white">
        <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-4">
          {currentContent.title}
        </h1>

        {currentContent.subtitle && (
          <h2 className="text-lg md:text-xl text-white/80 mb-3 tracking-wide">
            {currentContent.subtitle}
          </h2>
        )}

        <p className="text-lg mb-8 max-w-2xl mx-auto leading-relaxed text-white/90">
          {currentContent.description}
        </p>
      </div>

      {/* 🔹 Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/60 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </section>
  );
}
