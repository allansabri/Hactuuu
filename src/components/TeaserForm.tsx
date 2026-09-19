import { useState, FormEvent, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, Loader2 } from "lucide-react";

export default function TeaserForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // Check if already registered on mount
  useEffect(() => {
    const saved = localStorage.getItem("hbo_max_teaser_email");
    if (saved) {
      setStatus("success");
    }
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setErrorMessage("Veuillez entrer une adresse e-mail valide.");
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
      return;
    }

    setStatus("submitting");

    // Simulate luxury network delay is beautiful to build anticipation
    await new Promise((resolve) => setTimeout(resolve, 1200));

    try {
      localStorage.setItem("hbo_max_teaser_email", email);
      setStatus("success");
      setEmail("");
    } catch {
      setErrorMessage("Une erreur est survenue. Veuillez réessayer.");
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3500);
    }
  };

  return (
    <div className="w-full max-w-[480px] px-4 min-h-[64px] relative flex flex-col justify-center items-center">
      <AnimatePresence mode="wait">
        {status === "success" ? (
          <motion.div
            key="success-state"
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex flex-col sm:flex-row items-center gap-3 px-5 py-4 bg-[#0B0B0B]/80 backdrop-blur-md border border-[#8EA1AC]/20 rounded-lg shadow-[0_4px_30px_rgba(0,0,0,0.8)] text-center text-sm"
          >
            <div className="w-8 h-8 rounded-full bg-[#8EA1AC]/20 flex items-center justify-center border border-[#8EA1AC]/30 shrink-0">
              <Check className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col text-left">
              <p className="font-display font-medium text-white tracking-wide">
                INSCRIPTION VALIDÉE
              </p>
              <p className="text-[#AAB5BC] text-xs font-sans mt-0.5">
                Vous serez alerté en priorité dès le lancement de la plateforme.
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.form
            key="form-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit}
            className="w-full flex flex-col sm:flex-row items-stretch gap-3.5"
          >
            <div className="relative flex-1">
              <input
                id="email-input"
                type="email"
                required
                disabled={status === "submitting"}
                placeholder="Votre e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 px-5 bg-[#050505]/70 hover:bg-[#0B0B0B]/90 focus:bg-[#0B0B0B] text-white placeholder-[#5A6872] border border-[#222A30] hover:border-[#42505B] focus:border-[#8EA1AC]/70 focus:outline-none rounded transition-all duration-300 ease-out text-sm font-sans tracking-wide shadow-[inset_0_1px_2px_rgba(0,0,0,0.6)]"
              />
              {status === "error" && (
                <span className="absolute -bottom-5 left-1 text-[11px] text-[#A53E3E] font-sans tracking-wide">
                  {errorMessage}
                </span>
              )}
            </div>

            <button
              id="notify-button"
              type="submit"
              disabled={status === "submitting"}
              className="h-12 px-7 bg-[#2E3C45] hover:bg-[#8EA1AC] active:bg-[#6D7F8A] text-[#111] hover:text-black font-display font-semibold text-xs tracking-[0.16em] rounded transition-all duration-300 ease-out cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap shadow-[0_0_15px_rgba(142,161,172,0.15)] hover:shadow-[0_0_25px_rgba(142,161,172,0.35)] hover:scale-[1.02] border border-[#8EA1AC]/30"
              style={{
                backgroundColor: "rgba(142, 161, 172, 0.75)",
                color: "#111111",
              }}
            >
              {status === "submitting" ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  RECHERCHE...
                </>
              ) : (
                "ÊTRE PRÉVENU"
              )}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
