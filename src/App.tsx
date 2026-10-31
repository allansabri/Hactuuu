/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Lock, Unlock, Clock, AlertTriangle, X, Check, ShieldAlert } from "lucide-react";

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
    heightClass: "h-9 sm:h-10 md:h-8",
  },
  {
    name: "HBO",
    src: "/logos/hbo.svg",
    heightClass: "h-7 sm:h-8 md:h-7",
  },
  {
    name: "HBO Max Sport",
    src: "/logos/hbomax-sport.png",
    heightClass: "h-9 sm:h-10 md:h-8",
  },
];

// Repeat 4 times for seamless continuous infinite slide
const SLIDING_LOGOS = [...BRAND_LOGOS, ...BRAND_LOGOS, ...BRAND_LOGOS, ...BRAND_LOGOS];

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
}

export default function App() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFadingToBlack, setIsFadingToBlack] = useState(false);

  // Locked clue & Quiz states
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    return localStorage.getItem("hbo_date_unlocked") === "true";
  });
  const [isLocked, setIsLocked] = useState(false);
  const [remainingMs, setRemainingMs] = useState(0);
  const [lockoutReason, setLockoutReason] = useState<string | null>(null);
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [justUnlocked, setJustUnlocked] = useState(false);

  // Client ID for extra browser resilience
  const clientIdRef = useRef<string>("");
  useEffect(() => {
    let id = localStorage.getItem("hbo_client_uid");
    if (!id) {
      id = "client_" + Math.random().toString(36).substring(2, 12) + Date.now().toString(36);
      localStorage.setItem("hbo_client_uid", id);
    }
    clientIdRef.current = id;
  }, []);

  // Preload backdrop images
  useEffect(() => {
    BACKDROP_IMAGES.forEach((item) => {
      const img = new Image();
      img.src = item.src;
    });
  }, []);

  // 5 seconds fixed display followed by dip-to-black
  useEffect(() => {
    let switchTimer: ReturnType<typeof setTimeout>;

    const holdTimer = setTimeout(() => {
      setIsFadingToBlack(true);
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

  // Fetch status from server on mount
  const fetchQuizStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/quiz/status", {
        headers: {
          "x-client-id": clientIdRef.current || localStorage.getItem("hbo_client_uid") || "",
        },
      });
      if (!res.ok) return;
      const data = await res.json();

      if (data.unlocked) {
        setIsUnlocked(true);
        localStorage.setItem("hbo_date_unlocked", "true");
        setIsLocked(false);
      } else if (data.locked) {
        setIsLocked(true);
        setRemainingMs(data.remainingMs || 24 * 60 * 60 * 1000);
        setLockoutReason(data.lockoutReason || "attempts_exhausted");
      } else {
        setIsLocked(false);
        setAttemptsLeft(data.attemptsLeft ?? 3);
        if (data.question) {
          setCurrentQuestion(data.question);
        }
      }
    } catch (err) {
      console.warn("Failed to fetch quiz status:", err);
    }
  }, []);

  useEffect(() => {
    fetchQuizStatus();
  }, [fetchQuizStatus]);

  // Countdown timer when locked
  useEffect(() => {
    if (!isLocked || remainingMs <= 0) return;

    const interval = setInterval(() => {
      setRemainingMs((prev) => {
        if (prev <= 1000) {
          clearInterval(interval);
          fetchQuizStatus(); // Refresh when timer hits zero
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isLocked, remainingMs, fetchQuizStatus]);

  // Anti-cheat handler: triggered when user leaves tab/window while modal is open
  const triggerAntiCheat = useCallback(async () => {
    if (isUnlocked || isLocked || !isQuizModalOpen) return;

    try {
      const res = await fetch("/api/quiz/cheat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-client-id": clientIdRef.current || localStorage.getItem("hbo_client_uid") || "",
        },
      });
      const data = await res.json();
      setIsLocked(true);
      setAttemptsLeft(0);
      setLockoutReason("anti-cheat");
      setRemainingMs(data.remainingMs || 24 * 60 * 60 * 1000);
      setErrorMessage("Tentative de sortie détectée. Protocole anti-triche activé : verrouillage 24h.");
    } catch (err) {
      console.error("Anti-cheat trigger error:", err);
      setIsLocked(true);
      setLockoutReason("anti-cheat");
      setRemainingMs(24 * 60 * 60 * 1000);
    }
  }, [isUnlocked, isLocked, isQuizModalOpen]);

  // Anti-cheat listeners: visibilitychange + blur
  useEffect(() => {
    if (!isQuizModalOpen || isUnlocked || isLocked) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        triggerAntiCheat();
      }
    };

    const handleBlur = () => {
      // Blur can sometimes fire on simple select elements, so we check document.activeElement
      // but if the window itself loses focus (e.g. alt-tab or app switch), trigger anti-cheat
      setTimeout(() => {
        if (document.hidden || !document.hasFocus()) {
          triggerAntiCheat();
        }
      }, 100);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
    };
  }, [isQuizModalOpen, isUnlocked, isLocked, triggerAntiCheat]);

  // Handle answer submission
  const handleSubmitAnswer = async () => {
    if (selectedOption === null || isSubmitting || isLocked || isUnlocked) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/quiz/answer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-client-id": clientIdRef.current || localStorage.getItem("hbo_client_uid") || "",
        },
        body: JSON.stringify({ chosenIndex: selectedOption }),
      });

      const data = await res.json();

      if (data.unlocked) {
        setIsUnlocked(true);
        setJustUnlocked(true);
        localStorage.setItem("hbo_date_unlocked", "true");
        setIsLocked(false);
      } else if (data.locked) {
        setIsLocked(true);
        setAttemptsLeft(0);
        setLockoutReason(data.lockoutReason || "attempts_exhausted");
        setRemainingMs(data.remainingMs || 24 * 60 * 60 * 1000);
        setErrorMessage(data.message || "3 tentatives incorrectes. Accès verrouillé pour 24 heures.");
      } else {
        setAttemptsLeft(data.attemptsLeft ?? 1);
        setErrorMessage(data.message || "Mauvaise réponse. Réessayez.");
        setSelectedOption(null);
      }
    } catch (err) {
      console.error("Submit error:", err);
      setErrorMessage("Une erreur réseau est survenue. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format milliseconds into HH:MM:SS
  const formatCountdown = (ms: number) => {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, "0")}h ${minutes
      .toString()
      .padStart(2, "0")}m ${seconds.toString().padStart(2, "0")}s`;
  };

  return (
    <div className="relative w-full min-h-screen min-h-[100dvh] bg-[#08090C] text-white flex flex-col justify-between overflow-x-hidden overflow-y-auto md:overflow-hidden select-none font-sans">
      {/* Multi-stop cinematic backdrop mask */}
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

        {/* Dip-to-black overlay */}
        <div
          className={`absolute inset-0 w-full h-full bg-[#08090C] transition-opacity duration-[650ms] ease-in-out ${
            isFadingToBlack ? "opacity-100" : "opacity-0"
          }`}
        />
      </div>

      {/* ================= HEADER: LOGO TOP-LEFT ================= */}
      <header className="relative z-10 w-full px-6 sm:px-10 md:px-16 pt-[max(1.75rem,env(safe-area-inset-top))] md:pt-10 flex items-center justify-between">
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
      <main className="relative z-10 w-full px-6 sm:px-10 md:px-16 py-10 md:py-8 flex-1 flex flex-col justify-center max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-4 sm:space-y-5"
        >
          {/* Main Title: Transforms smoothly to 'LE 22 NOVEMBRE' once unlocked */}
          <div className="relative">
            <AnimatePresence mode="wait">
              {isUnlocked ? (
                <motion.h1
                  key="unlocked-title"
                  initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                  className="text-4xl sm:text-5xl md:text-5xl lg:text-[52px] xl:text-6xl font-bold tracking-tight uppercase font-maxactu-bold drop-shadow-[0_2px_12px_rgba(142,161,172,0.3)]"
                  style={{ color: "#8EA1AC", fontFamily: "'MaxactuSansBold', sans-serif" }}
                >
                  LE 22 NOVEMBRE
                </motion.h1>
              ) : (
                <motion.h1
                  key="default-title"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                  transition={{ duration: 0.6 }}
                  className="text-4xl sm:text-5xl md:text-5xl lg:text-[52px] xl:text-6xl font-bold tracking-tight uppercase font-maxactu-bold drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
                  style={{ color: "#8EA1AC", fontFamily: "'MaxactuSansBold', sans-serif" }}
                >
                  EN NOVEMBRE
                </motion.h1>
              )}
            </AnimatePresence>
          </div>

          {/* Description Text */}
          <p
            className="text-[15px] sm:text-base md:text-[14px] text-white font-normal leading-relaxed max-w-xl text-pretty font-maxactu-demi drop-shadow-[0_1px_5px_rgba(0,0,0,0.9)]"
            style={{ fontFamily: "'MaxactuDemi', sans-serif" }}
          >
            Bienvenue chez HBO Max Actu, le premier média indépendant sur HBO et HBO Max en France.
            Retrouvez les prochaines sorties, les projets en développement et en production, les bandes-annonces,
            le top 10, des articles, des critiques et bien plus encore...
          </p>

          {/* ================= INDICE VERROU ACTION BUTTON ================= */}
          <div className="pt-2">
            {isUnlocked ? (
              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#8EA1AC]/10 border border-[#8EA1AC]/30 text-xs sm:text-sm text-[#8EA1AC] font-medium backdrop-blur-md">
                <Unlock className="w-3.5 h-3.5 text-[#8EA1AC]" />
                <span>Date de sortie déverrouillée : <strong className="text-white">22 Novembre</strong></span>
              </div>
            ) : isLocked ? (
              <button
                onClick={() => setIsQuizModalOpen(true)}
                className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-lg bg-[#0E1015]/90 border border-white/10 text-xs sm:text-sm text-zinc-300 hover:text-white hover:border-white/20 transition-all backdrop-blur-md cursor-pointer"
              >
                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                <span>Accès verrouillé • Réessayer dans <span className="font-mono text-zinc-200">{formatCountdown(remainingMs)}</span></span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setErrorMessage(null);
                  setIsQuizModalOpen(true);
                }}
                className="group inline-flex items-center gap-2.5 px-4 py-2 rounded-lg bg-[#0E1015]/90 hover:bg-[#141720] border border-white/15 hover:border-[#8EA1AC]/40 text-xs sm:text-sm text-zinc-200 hover:text-white transition-all backdrop-blur-md shadow-lg shadow-black/40 cursor-pointer"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#8EA1AC] opacity-60"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#8EA1AC]"></span>
                </span>
                <Lock className="w-3.5 h-3.5 text-[#8EA1AC] group-hover:scale-105 transition-transform" />
                <span className="tracking-wide">Déverrouiller la date exacte • Indice</span>
              </button>
            )}
          </div>
        </motion.div>

        {/* ================= AUTO-SLIDING LOGOS ================= */}
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
      <footer className="relative z-10 w-full px-6 sm:px-10 md:px-16 pb-12 sm:pb-10 md:pb-8 pb-[max(3rem,calc(env(safe-area-inset-bottom)+1.5rem))] flex items-center justify-between text-xs text-zinc-400">
        <div className="flex items-center gap-2">
          <span>Suivez l&apos;actualité en direct sur</span>
          <a
            href="https://x.com/HBOMaxActuFR"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-medium text-white hover:text-[#8EA1AC] transition-colors"
          >
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

      {/* ================= INDICE VERROU MODAL ================= */}
      <AnimatePresence>
        {isQuizModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-lg bg-[#0C0E13] border border-white/10 rounded-2xl shadow-2xl p-6 sm:p-7 overflow-hidden text-zinc-200"
            >
              {/* Subtle ambient lighting */}
              <div className="absolute top-0 right-0 w-64 h-32 bg-[#8EA1AC]/5 blur-3xl pointer-events-none" />

              {/* Close Button (X) */}
              <button
                onClick={() => setIsQuizModalOpen(false)}
                className="absolute top-5 right-5 text-zinc-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5 cursor-pointer"
                title="Fermer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* STATE 1: UNLOCKED SUCCESS */}
              {isUnlocked ? (
                <div className="text-center py-6 space-y-4">
                  <div className="w-12 h-12 mx-auto rounded-full bg-[#8EA1AC]/15 border border-[#8EA1AC]/40 flex items-center justify-center text-[#8EA1AC]">
                    <Check className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white uppercase tracking-wider font-maxactu-bold">
                      Date Déverrouillée
                    </h3>
                    <p className="text-sm text-zinc-400 mt-1">
                      Le code d&apos;accès a été validé. La date officielle est désormais révélée.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                    <span className="text-xs uppercase text-[#8EA1AC] font-semibold tracking-widest block">
                      Lancement Officiel
                    </span>
                    <span className="text-2xl sm:text-3xl font-bold text-white tracking-wide mt-1 block font-maxactu-bold">
                      LE 22 NOVEMBRE
                    </span>
                  </div>
                  <button
                    onClick={() => setIsQuizModalOpen(false)}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#8EA1AC] hover:bg-[#9eb1bc] text-[#08090C] font-semibold text-sm transition-colors cursor-pointer"
                  >
                    Voir l&apos;annonce
                  </button>
                </div>
              ) : isLocked ? (
                /* STATE 2: LOCKED (24H COUNTDOWN) */
                <div className="text-center py-5 space-y-4">
                  <div className="w-12 h-12 mx-auto rounded-full bg-red-950/40 border border-red-500/30 flex items-center justify-center text-red-400">
                    {lockoutReason === "anti-cheat" ? (
                      <ShieldAlert className="w-6 h-6 text-red-400" />
                    ) : (
                      <Clock className="w-6 h-6 text-zinc-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-white uppercase tracking-wider font-maxactu-bold">
                      {lockoutReason === "anti-cheat"
                        ? "Protocole Anti-Triche Déclenché"
                        : "Tentatives Épuisées"}
                    </h3>
                    <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-sm mx-auto">
                      {lockoutReason === "anti-cheat"
                        ? "Une sortie de page ou un changement d'onglet a été détecté lors du défi. Votre accès est temporairement suspendu."
                        : "Vous avez utilisé vos 3 tentatives. L'accès est verrouillé pour 24 heures."}
                    </p>
                  </div>

                  {/* Countdown Card */}
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
                    <span className="text-[11px] uppercase tracking-wider text-zinc-400 block mb-1">
                      Prochaine tentative & nouvelle énigme dans
                    </span>
                    <span className="text-2xl sm:text-3xl font-mono font-bold text-white tracking-wider">
                      {formatCountdown(remainingMs)}
                    </span>
                  </div>

                  <p className="text-[11px] text-zinc-500 leading-tight">
                    Ce verrouillage est persistant et rattaché à votre session. Une nouvelle question sera proposée dès la fin du compte à rebours.
                  </p>

                  <button
                    onClick={() => setIsQuizModalOpen(false)}
                    className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-medium transition-colors cursor-pointer"
                  >
                    Fermer
                  </button>
                </div>
              ) : (
                /* STATE 3: ACTIVE QUIZ CHALLENGE */
                <div className="space-y-5">
                  {/* Category & Lives */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-[#8EA1AC]" />
                      <span className="text-[11px] uppercase tracking-widest text-[#8EA1AC] font-semibold">
                        Indice Verrou • Énigme du jour
                      </span>
                    </div>

                    {/* Lives (chances) */}
                    <div className="flex items-center gap-1.5" title={`${attemptsLeft} tentatives restantes`}>
                      <span className="text-[11px] text-zinc-400 mr-1">{attemptsLeft}/3 chances</span>
                      {[1, 2, 3].map((num) => (
                        <div
                          key={num}
                          className={`w-3.5 h-1.5 rounded-full transition-colors ${
                            num <= attemptsLeft ? "bg-[#8EA1AC]" : "bg-zinc-700 opacity-40"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Anti-cheat Warning Banner */}
                  <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-200/90 text-xs leading-relaxed">
                    <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong>Règle stricte anti-triche :</strong> Ne quittez pas la page et ne changez pas d&apos;onglet, sous peine de disqualification immédiate et de blocage pour 24h.
                    </span>
                  </div>

                  {/* The Question */}
                  <div>
                    <h4 className="text-base sm:text-lg font-semibold text-white leading-snug">
                      {currentQuestion?.question ||
                        "Quel est le nom du 9ème épisode de la série HBO « Ça : Bienvenue à Derry » ?"}
                    </h4>
                    <p className="text-xs text-zinc-400 mt-1">
                      Sélectionnez votre réponse pour valider le code de déverrouillage :
                    </p>
                  </div>

                  {/* Options List */}
                  <div className="space-y-2">
                    {(currentQuestion?.options || [
                      "The Black Spot",
                      "Bloodlines",
                      "Il n'y a pas de 9ème épisode",
                      "The Ritual of Chüd",
                    ]).map((option, idx) => {
                      const letters = ["A", "B", "C", "D"];
                      const isSelected = selectedOption === idx;
                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => setSelectedOption(idx)}
                          className={`w-full flex items-center text-left gap-3 px-3.5 py-3 rounded-xl border text-sm transition-all cursor-pointer ${
                            isSelected
                              ? "bg-[#8EA1AC]/20 border-[#8EA1AC] text-white shadow-sm"
                              : "bg-white/[0.02] border-white/10 hover:border-white/25 hover:bg-white/[0.05] text-zinc-300"
                          }`}
                        >
                          <span
                            className={`flex items-center justify-center w-6 h-6 rounded-md text-xs font-bold ${
                              isSelected
                                ? "bg-[#8EA1AC] text-[#08090C]"
                                : "bg-white/10 text-zinc-400"
                            }`}
                          >
                            {letters[idx]}
                          </span>
                          <span className="flex-1 font-medium">{option}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Error / Attempt message */}
                  {errorMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-red-400 bg-red-950/30 border border-red-500/20 px-3 py-2 rounded-lg"
                    >
                      {errorMessage}
                    </motion.div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsQuizModalOpen(false)}
                      className="w-1/3 py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-medium text-zinc-300 transition-colors cursor-pointer"
                    >
                      Annuler
                    </button>
                    <button
                      type="button"
                      disabled={selectedOption === null || isSubmitting}
                      onClick={handleSubmitAnswer}
                      className="w-2/3 py-2.5 px-4 rounded-xl bg-[#8EA1AC] hover:bg-[#9eb1bc] disabled:opacity-40 disabled:cursor-not-allowed text-[#08090C] font-semibold text-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-[#08090C] border-t-transparent rounded-full animate-spin" />
                          <span>Vérification...</span>
                        </>
                      ) : (
                        <span>Valider la réponse</span>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
