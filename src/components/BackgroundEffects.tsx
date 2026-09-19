import { motion } from "motion/react";

interface BackgroundEffectsProps {
  step?: number;
}

export default function BackgroundEffects({ step = 1 }: BackgroundEffectsProps) {
  // We can create a small list of subtle, high-end floating particles that breathe over the obsidian black viewport.
  // Using 15 elegant, very faint particles.
  const particles = Array.from({ length: 16 }).map((_, i) => ({
    id: i,
    x: 10 + (i * 7) % 80, // percentage positioning
    y: 15 + (i * 11) % 70, // percentage positioning
    size: 1 + (i % 3), // 1px to 3px
    duration: 12 + (i % 5) * 4, // 12s to 28s
    delay: (i % 4) * 2,
    opacity: 0.1 + (i % 3) * 0.08, // 0.1 to 0.26 opacity (very subtle)
  }));

  return (
    <div className="absolute inset-0 w-full h-full bg-[#050505] overflow-hidden pointer-events-none select-none z-0">
      {/* Cinematic Quilt Background Image that fades in elegantly when cards arrive */}
      <motion.div
        className="absolute inset-0 w-full h-full pointer-events-none bg-cover bg-center select-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: step >= 7 ? 0.28 : 0 }}
        transition={{ duration: 2.5, ease: "easeInOut" }}
        style={{
          backgroundImage: `url("https://beam-images.warnermediacdn.com/2025-11/MAX_Quilt_Pan-EMEA-12-November-2025.jpg?host=wbd-dotcom-drupal-prd-us-east-1.s3.amazonaws.com")`,
          WebkitMaskImage: "radial-gradient(circle at center, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 20%, rgba(0,0,0,0.2) 65%, rgba(0,0,0,0) 100%)",
          maskImage: "radial-gradient(circle at center, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 20%, rgba(0,0,0,0.2) 65%, rgba(0,0,0,0) 100%)"
        }}
      />

      {/* Radial vignette fade: keeps center illuminated and blends outer image edges to perfect solid black */}
      <motion.div
        className="absolute inset-0 w-full h-full pointer-events-none select-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: step >= 7 ? 0.4 : 0 }}
        transition={{ duration: 2.5, ease: "easeInOut" }}
        style={{
          backgroundImage: "radial-gradient(circle at center, transparent 30%, rgba(5, 5, 5, 0.5) 75%, #050505 100%)"
        }}
      />

      {/* Absolute Obsidian Base Noise/Texture Overlay */}
      <div 
        id="noise-overlay"
        className="absolute inset-0 opacity-[0.02] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Cinematic Digital Fog - Ambient Glow Blobs moving incredibly slowly */}
      <motion.div
        animate={{
          x: [0, 60, -40, 0],
          y: [0, -30, 40, 0],
          scale: [1, 1.15, 0.9, 1],
        }}
        transition={{
          duration: 35,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vh] bg-gradient-to-br from-[#8EA1AC]/3 to-transparent rounded-full blur-[140px] pointer-events-none"
      />

      <motion.div
        animate={{
          x: [0, -40, 50, 0],
          y: [0, 40, -30, 0],
          scale: [1, 0.85, 1.1, 1],
        }}
        transition={{
          duration: 40,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vh] bg-gradient-to-tr from-[#8EA1AC]/2 to-transparent rounded-full blur-[140px] pointer-events-none"
      />

      {/* Elegant digital dust particles mimicking theater air dust in projection light */}
      {particles.map((p) => {
        // Create custom organic non-linear offsets for each particle
        const dirSignVal = p.id % 2 === 0 ? 1 : -1;
        const driftX = (12 + (p.id % 5) * 6) * dirSignVal;
        const driftY = -(40 + (p.id % 4) * 15);

        return (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{
              opacity: [0, p.opacity, p.opacity * 0.7, p.opacity, p.opacity * 0.4, 0],
              y: [0, driftY * 0.3, driftY * 0.55, driftY * 0.8, driftY, driftY * 0.4, 0],
              x: [0, driftX * 0.4, -driftX * 0.2, driftX * 0.8, -driftX * 0.5, driftX * 0.2, 0],
              scale: [0.6, 1.1, 0.9, 1.2, 0.75, 0.6],
            }}
            transition={{
              duration: p.duration * 1.3, // Slower is more cinematic and premium
              repeat: Infinity,
              delay: p.delay,
              ease: "easeInOut",
            }}
            style={{
              position: "absolute",
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
            }}
            className="bg-[#8EA1AC]/60 rounded-full shadow-[0_0_6px_rgba(142,161,172,0.4)] pointer-events-none"
          />
        );
      })}
    </div>
  );
}
