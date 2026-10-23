/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";

interface BackdropItem {
  src: string;
  mobilePosition: string;
}

const BACKDROP_IMAGES: BackdropItem[] = [
  {
    src: "https://image.tmdb.org/t/p/original/6gqezQJ2mkm4jreWwLyOZy2Vf6i.jpg",
    mobilePosition: "73% center",
  },
  {
    src: "https://image.tmdb.org/t/p/original/g0VmjKGMyipJSlPwlQvlLBvXTAQ.jpg",
    mobilePosition: "70% center",
  },
  {
    src: "https://image.tmdb.org/t/p/original/nvUfKNPSXamOdUd3JaYr3kTaHe8.jpg",
    mobilePosition: "72% center",
  },
  {
    src: "https://image.tmdb.org/t/p/original/xYhCspt1luWHTKyTqZNWKxO751K.jpg",
    mobilePosition: "72% center",
  },
  {
    src: "https://image.tmdb.org/t/p/original/3rGzY1RaVgWIP4GuOTwdHwHXSgM.jpg",
    mobilePosition: "75% center",
  },
  {
    src: "https://image.tmdb.org/t/p/original/gPdyPwpnZHOLhOVDwATsDhiD5ca.jpg",
    mobilePosition: "70% center",
  },
];

interface BrandLogoItem {
  name: string;
  src: string;
  heightClass: string;
}

const BRAND_LOGOS: BrandLogoItem[] = [
  {
    name: "HBO Max",
    src: "/logos/hbomax-2025.png",
    heightClass: "h-6 sm:h-7 md:h-8",
  },
  {
    name: "HBO",
    src: "/logos/hbo.svg",
    heightClass: "h-5 sm:h-6 md:h-7",
  },
  {
    name: "HBO Max Sport",
    src: "/logos/hbomax-sport.png",
    heightClass: "h-6 sm:h-7 md:h-8",
  },
];

// Repeat 4 times for seamless continuous infinite slide
const SLIDING_LOGOS = [...BRAND_LOGOS, ...BRAND_LOGOS, ...BRAND_LOGOS, ...BRAND_LOGOS];

export default function App() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFadingToBlack, setIsFadingToBlack] = useState(false);

  // Preload all backdrop images immediately on mount for instant zero-lag rendering
  useEffect(() => {
    BACKDROP_IMAGES.forEach((item) => {
      const img = new Image();
      img.src = item.src;
    });
  }, []);

  // 5 seconds fixed display followed by a smooth dip-to-black transition (fondu au noir)
  useEffect(() => {
    let switchTimer: ReturnType<typeof setTimeout>;

    const holdTimer = setTimeout(() => {
      // 1. Fade image out into black
      setIsFadingToBlack(true);

      // 2. Once screen has reached pure black (~650ms), swap image and fade back in
      switchTimer = setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % BACKDROP_IMAGES.length);
        setIsFadingToBlack(false);
      }, 650);
    }, 5000);

    return () => {
      clearTimeout(holdTimer);
      if (switchTimer) clearTimeout(switchTimer);
    };
  }, [currentIndex]);


  return (
    <div className="relative w-full min-h-screen bg-[#08090C] text-white flex flex-col justify-between overflow-x-hidden overflow-y-auto md:overflow-hidden select-none font-sans">
      {/* Smooth multi-stop cinematic mask to completely eliminate any visible line or separation */}
      <style>{`
        .cinematic-backdrop-mask {
          -webkit-mask-image: linear-gradient(to right, 
            rgba(0, 0, 0, 0) 0%, 
            rgba(0, 0, 0, 0) 12%, 
            rgba(0, 0, 0, 0.02) 18%, 
            rgba(0, 0, 0, 0.06) 25%, 
            rgba(0, 0, 0, 0.13) 32%, 
            rgba(0, 0, 0, 0.23) 40%, 
            rgba(0, 0, 0, 0.36) 48%, 
            rgba(0, 0, 0, 0.52) 57%, 
            rgba(0, 0, 0, 0.70) 66%, 
            rgba(0, 0, 0, 0.85) 75%, 
            rgba(0, 0, 0, 0.95) 82%, 
            rgba(0, 0, 0, 1) 86%, 
            rgba(0, 0, 0, 1) 100%
          );
          mask-image: linear-gradient(to right, 
            rgba(0, 0, 0, 0) 0%, 
            rgba(0, 0, 0, 0) 12%, 
            rgba(0, 0, 0, 0.02) 18%, 
            rgba(0, 0, 0, 0.06) 25%, 
            rgba(0, 0, 0, 0.13) 32%, 
            rgba(0, 0, 0, 0.23) 40%, 
            rgba(0, 0, 0, 0.36) 48%, 
            rgba(0, 0, 0, 0.52) 57%, 
            rgba(0, 0, 0, 0.70) 66%, 
            rgba(0, 0, 0, 0.85) 75%, 
            rgba(0, 0, 0, 0.95) 82%, 
            rgba(0, 0, 0, 1) 86%, 
            rgba(0, 0, 0, 1) 100%
          );
        }
        .hero-backdrop-img {
          object-position: var(--mobile-pos, 72% center);
        }
        @media (min-width: 768px) {
          .cinematic-backdrop-mask {
            -webkit-mask-image: linear-gradient(to right, 
              transparent 0%, 
              transparent 18%, 
              rgba(0,0,0,0.01) 23%, 
              rgba(0,0,0,0.05) 28%, 
              rgba(0,0,0,0.13) 34%, 
              rgba(0,0,0,0.26) 41%, 
              rgba(0,0,0,0.44) 49%, 
              rgba(0,0,0,0.64) 57%, 
              rgba(0,0,0,0.82) 66%, 
              rgba(0,0,0,0.94) 75%, 
              black 85%, 
              black 100%
            );
            mask-image: linear-gradient(to right, 
              transparent 0%, 
              transparent 18%, 
              rgba(0,0,0,0.01) 23%, 
              rgba(0,0,0,0.05) 28%, 
              rgba(0,0,0,0.13) 34%, 
              rgba(0,0,0,0.26) 41%, 
              rgba(0,0,0,0.44) 49%, 
              rgba(0,0,0,0.64) 57%, 
              rgba(0,0,0,0.82) 66%, 
              rgba(0,0,0,0.94) 75%, 
              black 85%, 
              black 100%
            );
          }
          .hero-backdrop-img {
            object-position: center center !important;
          }
        }

        @keyframes slideLogos {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-25%);
          }
        }

        .logos-slide-track {
          display: flex;
          align-items: center;
          width: max-content;
          animation: slideLogos 18s linear infinite;
        }

        .logos-slide-track:hover {
          animation-play-state: paused;
        }

        .logos-slider-mask {
          -webkit-mask-image: linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%);
          mask-image: linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%);
        }
      `}</style>

      {/* ================= RIGHT-SIDE CINEMATIC SLIDESHOW ================= */}
      <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden z-0 cinematic-backdrop-mask">
        {/* Fixed steady images without any scale/zoom */}
        {BACKDROP_IMAGES.map((item, idx) => (
          <img
            key={item.src}
            src={item.src}
            alt="HBO Max Actu visual"
            loading={idx === 0 ? "eager" : "lazy"}
            className={`hero-backdrop-img absolute inset-0 w-full h-full object-cover ${
              idx === currentIndex ? "opacity-100" : "opacity-0"
            }`}
            style={{
              ["--mobile-pos" as string]: item.mobilePosition,
            } as React.CSSProperties}
          />
        ))}

        {/* Dip-to-black overlay: smooth fade to black and back to reveal next image */}
        <div
          className={`absolute inset-0 w-full h-full bg-[#08090C] transition-opacity duration-[650ms] ease-in-out ${
            isFadingToBlack ? "opacity-100" : "opacity-0"
          }`}
        />
      </div>

      {/* ================= HEADER: LOGO TOP-LEFT (NO BUTTONS) ================= */}
      <header className="relative z-10 w-full px-6 sm:px-10 md:px-16 pt-8 md:pt-10 flex items-center justify-between">
        <a
          href="https://x.com/HBOMaxActuFR"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block transition-transform hover:scale-[1.02] focus:outline-none"
          title="HBO Max Actu"
        >
          <img
            src="https://i.ibb.co/5WnymfKN/HBO-Max-Actu.png"
            alt="HBO Max Actu"
            className="h-5 sm:h-6 md:h-7 w-auto object-contain filter drop-shadow-md"
          />
        </a>
      </header>

      {/* ================= MAIN CONTENT: LEFT COLUMN ================= */}
      <main className="relative z-10 w-full px-6 sm:px-10 md:px-16 py-12 md:py-8 flex-1 flex flex-col justify-center max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-4 sm:space-y-5"
        >
          {/* Main Title: EN NOVEMBRE (MaxactuSansBold, all caps, larger font) */}
          <h1
            className="text-4xl sm:text-5xl md:text-5xl lg:text-[52px] xl:text-6xl font-bold tracking-tight uppercase font-maxactu-bold drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
            style={{ color: "#8EA1AC", fontFamily: "'MaxactuSansBold', sans-serif" }}
          >
            EN NOVEMBRE
          </h1>

          {/* Description Text: maxactu_demi */}
          <p
            className="text-xs sm:text-sm md:text-[14px] text-white font-normal leading-relaxed max-w-xl text-pretty font-maxactu-demi drop-shadow-[0_1px_5px_rgba(0,0,0,0.9)]"
            style={{ fontFamily: "'MaxactuDemi', sans-serif" }}
          >
            Bienvenue chez HBO Max Actu, le premier média indépendant sur HBO et HBO Max en France.
            Retrouvez les prochaines sorties, les projets en développement et en production, les bandes-annonces,
            le top 10, des articles, des critiques et bien plus encore...
          </p>
        </motion.div>

        {/* ================= AUTO-SLIDING LOGOS (positioned midway between text and footer) ================= */}
        <div className="mt-8 sm:mt-12 md:mt-16 max-w-md sm:max-w-lg md:max-w-xl">
          <div className="relative w-full overflow-hidden logos-slider-mask py-2">
            <div className="logos-slide-track">
              {SLIDING_LOGOS.map((logo, index) => (
                <div
                  key={`${logo.name}-${index}`}
                  className="flex-shrink-0 flex items-center justify-center px-5 sm:px-7 md:px-8"
                  title={logo.name}
                >
                  <img
                    src={logo.src}
                    alt={logo.name}
                    loading="lazy"
                    className={`${logo.heightClass} w-auto object-contain opacity-80 hover:opacity-100 transition-opacity filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]`}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* ================= FOOTER / SOCIAL LINK ================= */}
      <footer className="relative z-10 w-full px-6 sm:px-10 md:px-16 pb-6 md:pb-8 flex items-center justify-between text-xs text-zinc-400">
        <div className="flex items-center gap-2">
          <span>Suivez l&apos;actualité en direct sur</span>
          <a
            href="https://x.com/HBOMaxActuFR"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-medium text-white hover:text-[#8EA1AC] transition-colors"
          >
            {/* X Logo */}
            <svg
              className="w-3.5 h-3.5 fill-current"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            <span>@HBOMaxActuFR</span>
          </a>
        </div>
      </footer>
    </div>
  );
}
