/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import BackgroundEffects from "./components/BackgroundEffects";
import VerticalLines from "./components/VerticalLines";
import ChatAssistant from "./components/ChatAssistant";
import AuthorNotificationModal from "./components/AuthorNotificationModal";

const posters = [
  "https://image.tmdb.org/t/p/original/kvFSpESyBZMjaeOJDx7RS3P1jey.jpg", // The Pitt (Max Original)
  "https://image.tmdb.org/t/p/original/bB3G6Ug1jfsOUptb0RJsqrgMVta.jpg", // Creature Commandos (DC / Max Original)
  "https://image.tmdb.org/t/p/original/yb4F1Oocq8GfQt6iIuAgYEBokhG.jpg", // Peacemaker (DC / Max Original)
  "https://image.tmdb.org/t/p/original/ca5XiEFgyGsI38QT3wEKa1QVGX.jpg", // Hacks (Max Original)
  "https://image.tmdb.org/t/p/original/SJCnXVBJZh7X7ePLt6XMp6TZAj.jpg", // Harry Potter (HBO / Max Original)
  "https://image.tmdb.org/t/p/original/vknbnvegsTrzjqa8fsPyXN4wCHI.jpg", // The Seduction / Merteuil (Max Original France)
  "https://image.tmdb.org/t/p/original/fi1b6U1kp73xheECzqwzMn8u3mX.jpg", // Adventure Time: Fionna and Cake (Max Original)
  "https://image.tmdb.org/t/p/original/2b6E0pN19IGsmxSv6HyTKydKKdb.jpg", // And Just Like That… (Max Original)
  "https://image.tmdb.org/t/p/original/zHE48oJaLb9da91kghWSMWA6ywj.jpg", // A Knight in the Making (Max Original)
  "https://image.tmdb.org/t/p/original/gdhFwnAfIlAE65ugGN8q3aj3fI9.jpg", // House of the Dragon: The House That Dragons Built (Max Original)
  "https://image.tmdb.org/t/p/original/amoBYUQhXjUGdcPviy3ja6xJOOE.jpg", // L'affaire Laura Stern (Max Original France)
  "https://image.tmdb.org/t/p/original/t0X9TVBkqJlTsdWZCTADsQqg4gC.jpg", // Youth (Max Original)
  "https://image.tmdb.org/t/p/original/txj8ujTZwGUjpCdhCsQBnTlh4aS.jpg", // Stuart Fails to Save the Universe (Max Original)
  "https://image.tmdb.org/t/p/original/4EGhg689jbAO865qWs8AznalyWl.jpg", // Paolo (Max Original France)
  "https://image.tmdb.org/t/p/original/ivhZRKB2Z8gM2JdB1i2dEeUwaNr.jpg", // On the Roam (Max Original)
  "https://image.tmdb.org/t/p/original/1iOeXGkaYAvyTos49faaBHUtwqe.jpg", // Dunkman (Max Original)
  "https://image.tmdb.org/t/p/original/g0mWNUELRT1Oa2Phqt0YrqJeXX1.jpg", // Krypto Saves the Day! (Max Original)
  "https://image.tmdb.org/t/p/original/6RNbBESf3DTaFqEys7slb7xzCUH.jpg", // Professeur Raoult vs le gang des Cerises (Max Original France)
];


export default function App() {
  const [step] = useState(8);
  const [isXHovered, setIsXHovered] = useState(false);
  const [isAuthorModalOpen, setIsAuthorModalOpen] = useState(false);

  // Automatically show the author account notification popup upon arrival
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAuthorModalOpen(true);
    }, 700);
    return () => clearTimeout(timer);
  }, []);
  
  // Content animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.25,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <main className="relative w-screen h-screen min-h-screen bg-[#050505] text-white flex flex-col justify-between items-center overflow-hidden font-sans select-none">
      {/* Cinematic Dynamic Background & Atmospheric VFX */}
      <BackgroundEffects step={step} />

      {/* TOP DECK - Header elements */}
      <header className="w-full max-w-7xl mx-auto px-6 sm:px-8 py-5 sm:py-6 flex justify-between items-center z-20 shrink-0 pointer-events-none">
        <div className="pointer-events-auto">
          <AnimatePresence>
            {isAuthorModalOpen && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                onClick={() => setIsAuthorModalOpen(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/60 hover:bg-black/90 border border-white/10 hover:border-white/25 backdrop-blur-md text-xs text-zinc-300 hover:text-white transition-all duration-300 cursor-pointer shadow-lg"
                aria-label="Informations Compte Auteur"
              >
                <span className="font-medium tracking-tight">Compte Auteur</span>
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* CORE DISPLAY - Dynamic centered cinematic area */}
      <div className="flex-1 w-full flex flex-col justify-center items-center relative z-10 px-4">
        {/* Animated Cylinder Lighting Backdrop */}
        <VerticalLines step={step} />

        {/* Dynamic Logo Manifestation Area with perfect 100% pixel-perfect continuity */}
        <div className={`relative flex items-center justify-center overflow-visible transition-all duration-1000 ${
          step >= 7 
            ? "w-[94vw] max-w-[580px] sm:max-w-[720px] md:max-w-[900px] lg:max-w-[1100px] h-[110px] sm:h-[145px] md:h-[195px] lg:h-[230px] mb-1 sm:mb-1.5 md:mb-2 mt-1 sm:mt-2" 
            : "w-[320px] sm:w-[440px] h-[110px] sm:h-[150px] mb-4 md:mb-5"
        }`}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{
              opacity: 
                step < 3 ? 0 : 1,
              scale: 
                step < 5 ? 1.0 : 
                step === 5 ? 1.03 : 
                step === 6 ? 1.06 : 
                step === 7 ? 1.09 : 1.12, // Continuous elegant cinematic swelling without shrinking
              y: 
                step < 3 ? "24%" :
                step === 3 || step === 4 ? "24%" : // Kept centered for classic HBO
                step === 5 ? "11%" : 
                "0%", // Slides seamlessly up so HBO rises and max emerges below
              clipPath: 
                step < 5 
                  ? "inset(0% 0% 42% 0%)" // Crops out the bottom "max" completely
                  : step >= 7
                  ? "none" // Prevents any cropping for iridescent HBO Max and custom final logo
                  : "inset(0% 0% 0% 0%)", // Reveals "max" perfectly
              filter: 
                step < 3 
                  ? "grayscale(1) brightness(0.1) blur(8px)"
                  : step === 3 || step === 4
                  ? "grayscale(1) brightness(1.25) contrast(1.1) blur(0px)" 
                  : step === 5
                  ? "grayscale(1) brightness(1.25) contrast(1.1) blur(0px)" 
                  : "grayscale(0) brightness(1.0) contrast(1.05) blur(0px)" 
            }}
            transition={
              step >= 7
                ? {
                    scale: { duration: 1.8, ease: [0.16, 1, 0.3, 1] },
                    y: { duration: 1.8, ease: [0.16, 1, 0.3, 1] },
                    clipPath: { duration: 1.8, ease: [0.16, 1, 0.3, 1] },
                    filter: { duration: 2.2, ease: "easeInOut" }, // Slow, magical color bloom
                    opacity: { duration: 1.8 },
                  }
                : {
                    duration: 2.2,
                    ease: [0.16, 1, 0.3, 1],
                  }
            }
            className="absolute w-full h-full flex items-center justify-center pointer-events-none"
          >
            {/* Iridescent Logo */}
            <motion.img
              animate={{
                opacity: step < 8 ? 1 : 0,
                scale: step < 8 ? 1.0 : 0.96,
                filter: step < 8 ? "none" : "blur(12px)",
              }}
              transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
              src="https://beam-images.warnermediacdn.com/2025-06/hbo-max-logo-iridescent-2025.png?host=wbd-dotcom-drupal-prd-us-east-1.s3.amazonaws.com"
              alt="HBO Max Logo"
              referrerPolicy="no-referrer"
              className="absolute w-[80%] sm:w-[85%] md:w-[90%] lg:w-[94%] h-full object-contain select-none"
            />

            {/* Custom Final Logo */}
            <motion.img
              initial={{ opacity: 0, scale: 1.05, filter: "brightness(1.5) blur(12px)" }}
              animate={{
                opacity: step >= 8 ? 1 : 0,
                scale: step >= 8 ? 1.0 : 1.05,
                filter: step >= 8 ? "brightness(1.15) blur(0px)" : "brightness(1.5) blur(12px)",
              }}
              transition={{ duration: 2.0, ease: [0.16, 1, 0.3, 1] }}
              src="https://i.ibb.co/5WnymfKN/HBO-Max-Actu.png"
              alt="HBO Max Actu Logo"
              referrerPolicy="no-referrer"
              className="absolute w-[75vw] max-w-[270px] sm:max-w-[360px] md:max-w-[480px] lg:max-w-[570px] h-auto object-contain select-none"
            />
          </motion.div>
        </div>

        {/* Tagline, subtext and poster carousel - revealed in Step 7 */}
        <div className={`w-full max-w-5xl md:max-w-none text-center flex flex-col items-center overflow-visible transition-all duration-1000 ${
          step >= 8 ? "-mt-5 sm:-mt-10 md:-mt-16 lg:-mt-22" : ""
        }`}>
          <AnimatePresence>
            {step >= 7 && (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="w-full flex flex-col items-center overflow-visible"
              >
                {/* Main luxurious uppercase headers */}
                <motion.h1 
                  variants={itemVariants}
                  className="font-display text-[11px] min-[390px]:text-xs sm:text-base md:text-lg tracking-[0.05em] sm:tracking-[0.08em] font-light text-white mb-1 sm:mb-1.5 uppercase whitespace-nowrap"
                >
                  Le guide de références HBO Max en France
                </motion.h1>
 
                <motion.h2 
                  variants={itemVariants}
                  className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-[#8EA1AC] tracking-normal mb-3 sm:mb-4 uppercase"
                >
                  En novembre
                </motion.h2>
 
                {/* Cinema Infinite Scrolling Poster Ribbon */}
                <motion.div 
                  variants={itemVariants}
                  className="relative -mx-4 w-[calc(100%+2rem)] max-w-none md:mx-0 md:max-w-none md:w-screen overflow-hidden py-3 md:py-4 pointer-events-auto z-20 hbo-marquee-wrapper"
                >
                  {/* Inject Hardware-Accelerated CSS Custom Keyframes for seamless 60fps+ Compositor Scrolling */}
                  <style dangerouslySetInnerHTML={{ __html: `
                    @keyframes hboMarquee {
                      0% {
                        transform: translate3d(0, 0, 0);
                      }
                      100% {
                        transform: translate3d(-50%, 0, 0);
                      }
                    }
                    .hbo-marquee-wrapper {
                      -webkit-mask-image: linear-gradient(to right, transparent 0%, black 20px, black calc(100% - 20px), transparent 100%);
                      mask-image: linear-gradient(to right, transparent 0%, black 20px, black calc(100% - 20px), transparent 100%);
                    }
                    @media (min-width: 640px) {
                      .hbo-marquee-wrapper {
                        -webkit-mask-image: linear-gradient(to right, transparent 0%, black 32px, black calc(100% - 32px), transparent 100%);
                        mask-image: linear-gradient(to right, transparent 0%, black 32px, black calc(100% - 32px), transparent 100%);
                      }
                    }
                    @media (min-width: 1024px) {
                      .hbo-marquee-wrapper {
                        -webkit-mask-image: linear-gradient(to right, transparent 0%, black 44px, black calc(100% - 44px), transparent 100%);
                        mask-image: linear-gradient(to right, transparent 0%, black 44px, black calc(100% - 44px), transparent 100%);
                      }
                    }
                    .hbo-marquee-track {
                      display: flex;
                      width: max-content;
                      animation: hboMarquee 38s linear infinite;
                      will-change: transform;
                      backface-visibility: hidden;
                      -webkit-backface-visibility: hidden;
                    }
                    @media (hover: hover) and (pointer: fine) {
                      .hbo-marquee-wrapper:hover .hbo-marquee-track {
                        animation-play-state: paused;
                      }
                    }
                  `}} />
                  
                  {/* Ribbon Track with two identical groups for 100% mathematically seamless infinite loop */}
                  <div className="hbo-marquee-track">
                    {[0, 1].map((groupIndex) => (
                      <div 
                        key={groupIndex} 
                        className="flex gap-3 sm:gap-4 md:gap-6 pr-3 sm:pr-4 md:pr-6 shrink-0"
                        aria-hidden={groupIndex === 1}
                      >
                        {posters.map((poster, index) => (
                          <div 
                            key={index}
                            className="w-[95px] sm:w-[130px] md:w-[172px] h-[142px] sm:h-[195px] md:h-[258px] flex-shrink-0 rounded-none overflow-hidden border border-white/5 bg-zinc-900/40 shadow-2xl relative select-none transition-transform duration-300 md:hover:scale-105"
                          >
                            <img 
                              src={poster} 
                              alt={`Poster ${index}`}
                              referrerPolicy="no-referrer"
                              draggable="false"
                              className="w-full h-full object-cover select-none pointer-events-none"
                            />
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* BOTTOM DECK - Footer elements */}
      <footer className="w-full px-8 py-6 z-20 shrink-0 pointer-events-none">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: step >= 7 ? 0.65 : 0 }}
          transition={{ duration: 1.5, delay: 0.6 }}
          className="flex flex-col items-center justify-center pointer-events-auto relative"
        >
          {/* Extremely minimalist micro tooltip */}
          <AnimatePresence>
            {isXHovered && (
              <motion.div
                initial={{ opacity: 0, y: 3, scale: 0.96 }}
                animate={{ opacity: 1, y: -4, scale: 1 }}
                exit={{ opacity: 0, y: 3, scale: 0.96 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className="absolute bottom-full mb-2 bg-[#090a0c]/95 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded text-[10px] font-mono tracking-widest text-[#8EA1AC] uppercase select-none pointer-events-none shadow-2xl"
              >
                @HBOMaxActuFR
              </motion.div>
            )}
          </AnimatePresence>

          {/* X monochrome logo */}
          <a
            href="https://x.com/HBOMaxActuFR"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="X (Twitter) - @HBOMaxActuFR"
            onMouseEnter={() => setIsXHovered(true)}
            onMouseLeave={() => setIsXHovered(false)}
            onFocus={() => setIsXHovered(true)}
            onBlur={() => setIsXHovered(false)}
            className="text-[#AAB5BC] hover:text-white transition-all duration-300 hover:scale-105 p-2 flex items-center justify-center"
          >
            <svg
              className="w-4 h-4"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
        </motion.div>
      </footer>

      {/* Floating interactive FAQ assistant */}
      <ChatAssistant isVisible={step >= 7} />

      {/* White Author Account Notification Modal */}
      <AuthorNotificationModal
        isOpen={isAuthorModalOpen}
        onClose={() => setIsAuthorModalOpen(false)}
      />
    </main>
  );
}
