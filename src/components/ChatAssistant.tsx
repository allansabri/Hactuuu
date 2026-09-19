import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  isDemain?: boolean;
}

interface ChatAssistantProps {
  isVisible: boolean;
}

const FAQ_DATA = [
  {
    question: "HBOMaxActu, c’est quoi exactement ?",
    answer: "HBOMaxActu est un futur média indépendant entièrement dédié à HBO Max. L’objectif est simple : réunir au même endroit les actualités, les sorties, les séries, les films et tout ce qu’il faut savoir sur l’univers HBO Max."
  },
  {
    question: "Que vais-je trouver sur HBOMaxActu ?",
    answer: "Des actualités, des guides, des fiches séries et films, les prochaines sorties, des classements et bien d’autres fonctionnalités en préparation."
  },
  {
    question: "Est-ce que je pourrai suivre les futures sorties HBO Max ?",
    answer: "Oui. Une section entière sera consacrée aux contenus à venir avec les dates de sortie, les nouvelles saisons et les projets les plus attendus."
  },
  {
    question: "Comment savoir quoi regarder ?",
    answer: "Le site mettra en avant les nouveautés, les tendances du moment, les contenus populaires et des recommandations pour vous aider à trouver votre prochain programme."
  },
  {
    question: "Est-ce qu’il y aura des fiches séries et films ?",
    answer: "Oui. Chaque production disposera de sa propre fiche avec les informations essentielles, les saisons, les bandes-annonces et les contenus associés."
  },
  {
    question: "Ça sort quand ?",
    answer: "Demain." // Custom interactive flow handled separately
  }
];

export default function ChatAssistant({ isVisible }: ChatAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      sender: "bot",
      text: "Bonjour ! Je suis l'assistant de HBOMaxActu. Cliquez sur l'une des questions ci-dessous pour en savoir plus sur notre projet."
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [demainStatus, setDemainStatus] = useState<"idle" | "shaking" | "panicked">("idle");
  const [currentTime, setCurrentTime] = useState("");
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Time stamp on top of the chat thread
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, "0");
      const minutes = now.getMinutes().toString().padStart(2, "0");
      setCurrentTime(`Aujourd'hui À ${hours}:${minutes}`);
    };
    updateTime();
  }, []);

  // Scroll to show latest message bubble perfectly
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping, demainStatus, isOpen]);

  const handleSelectQuestion = (q: string, a: string) => {
    if (isTyping) return;
    
    // 1. Add User Question Message
    const userMsgId = Math.random().toString();
    setMessages((prev) => [...prev, { id: userMsgId, sender: "user", text: q }]);
    
    // 2. Start Typing indicator
    setIsTyping(true);
    
    // 3. custom reactive sequence for "Ça sort quand ?"
    if (q.includes("Ça sort quand")) {
      setTimeout(() => {
        setIsTyping(false);
        const demainMsgId = "demain-msg";
        setMessages((prev) => [
          ...prev,
          { id: demainMsgId, sender: "bot", text: "Demain.", isDemain: true }
        ]);
        
        setTimeout(() => {
          setDemainStatus("shaking");
          
          setTimeout(() => {
            setDemainStatus("panicked");
            setIsTyping(true);
            
            setTimeout(() => {
              setIsTyping(false);
              const oopsMsgId = Math.random().toString();
              setMessages((prev) => [
                ...prev,
                { id: oopsMsgId, sender: "bot", text: "Ah non, quand même pas. 😅" }
              ]);
              
              setIsTyping(true);
              setTimeout(() => {
                setIsTyping(false);
                const finalMsgId = Math.random().toString();
                setMessages((prev) => [
                  ...prev,
                  { 
                    id: finalMsgId, 
                    sender: "bot", 
                    text: "Le projet est encore en développement et je prends le temps de construire quelque chose de vraiment solide. Ça sort très bientôt ! En attendant, suivez l'actualité sur mon compte X @HBOMaxActuFr pour être tenu au courant." 
                  }
                ]);
                setDemainStatus("idle");
              }, 1800);
              
            }, 1100);
          }, 1400); 
        }, 1200); 
      }, 950);
      
    } else {
      // Standard flow
      setTimeout(() => {
        setIsTyping(false);
        const botMsgId = Math.random().toString();
        setMessages((prev) => [...prev, { id: botMsgId, sender: "bot", text: a }]);
      }, 950);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-auto">
      {/* Compact Cozy Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="w-[305px] sm:w-[335px] h-[405px] sm:h-[465px] bg-white border border-slate-300 rounded-xl overflow-hidden flex flex-col shadow-[0_15px_45px_rgba(0,0,0,0.25)] mb-3"
          >
            {/* Header */}
            <div className="h-12 bg-black px-4 flex items-center justify-between shrink-0 select-none border-b border-zinc-950">
              <button
                onClick={() => setIsOpen(false)}
                className="text-zinc-400 hover:text-white transition-colors duration-200 p-1"
                title="Fermer"
              >
                <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 13l-7 7-7-7" />
                </svg>
              </button>

              {/* Logo */}
              <div className="flex items-center justify-center">
                <img
                  src="https://i.ibb.co/5WnymfKN/HBO-Max-Actu.png"
                  alt="HBO Max Actu Logo"
                  referrerPolicy="no-referrer"
                  className="h-6 sm:h-7 w-auto object-contain select-none max-w-[140px] drop-shadow-sm"
                />
              </div>

              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="text-zinc-400 hover:text-white transition-colors p-1"
                title="Fermer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Chat Thread Area (Messages ONLY for clean scrolling) */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3.5 bg-white scrollbar-thin">
              <div className="text-right text-[9px] font-sans text-slate-400 py-0.5 select-none">
                {currentTime}
              </div>

              <div className="space-y-3">
                {messages.map((msg) => {
                  const isUser = msg.sender === "user";
                  
                  if (msg.isDemain) {
                    return (
                      <div key={msg.id} className="flex justify-start">
                        <motion.div
                          animate={
                            demainStatus === "shaking"
                              ? {
                                  x: [-10, 10, -8, 8, -6, 6, -3, 3, 0],
                                  y: [-2, 3, -1, 2, 0],
                                  rotate: [-2, 2, -1, 1, 0],
                                  scale: [1, 1.12, 1.05, 1.08, 1],
                                  backgroundColor: ["#F4F4F4", "#FEE2E2", "#FEE2E2", "#F4F4F4"]
                                }
                              : demainStatus === "panicked"
                              ? { scale: 0.96, opacity: 0.9, backgroundColor: "#EF4444", color: "#FFFFFF" }
                              : { scale: 1 }
                          }
                          transition={{
                            duration: demainStatus === "shaking" ? 1.3 : 0.22,
                            ease: "easeInOut"
                          }}
                          className={`max-w-[85%] rounded-lg px-3.5 py-2 text-xs leading-relaxed font-sans shadow-xs border ${
                            demainStatus === "panicked"
                              ? "bg-red-500 text-white border-red-600 font-bold"
                              : "bg-[#F4F4F4] text-slate-900 border-slate-200"
                          }`}
                        >
                          <div className="flex items-center gap-1 justify-start">
                            <span>{msg.text}</span>
                            {demainStatus === "shaking" && (
                              <motion.span 
                                animate={{ scale: [1, 1.2, 1] }} 
                                transition={{ repeat: Infinity, duration: 0.4 }}
                                className="text-sm"
                              >
                                ⏳⚠️
                              </motion.span>
                            )}
                            {demainStatus === "panicked" && (
                              <span className="text-xs animate-pulse">😰</span>
                            )}
                          </div>
                          
                          {demainStatus === "shaking" && (
                            <motion.div 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="text-[8px] font-mono mt-0.5 text-red-600 uppercase tracking-wider"
                            >
                              * ERREUR SYSTEME *
                            </motion.div>
                          )}
                        </motion.div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                    >
                      <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: 8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className={`max-w-[85%] rounded-lg px-3.5 py-2 text-xs leading-relaxed font-sans border shadow-xs ${
                          isUser
                            ? "bg-[#D5DBE1] text-[#0F172A] border-slate-300 rounded-tr-none font-medium"
                            : "bg-[#F4F4F4] text-slate-900 border-slate-200 rounded-tl-none"
                        }`}
                      >
                        {msg.text.includes("@HBOMaxActuFr") ? (
                          <span>
                            {msg.text.split("@HBOMaxActuFr")[0]}
                            <a
                              href="https://x.com/HBOMaxActuFr"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-bold text-sky-600 hover:text-sky-800 underline"
                            >
                              @HBOMaxActuFr
                            </a>
                            {msg.text.split("@HBOMaxActuFr")[1]}
                          </span>
                        ) : (
                          msg.text
                        )}
                      </motion.div>
                    </div>
                  );
                })}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-[#F4F4F4] border border-slate-200 rounded-lg rounded-tl-none px-3.5 py-2 flex items-center gap-1 shadow-xs">
                      <span className="w-1.2 h-1.2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-1.2 h-1.2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-1.2 h-1.2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                )}
              </div>

              <div ref={chatEndRef} />
            </div>

            {/* Fixed Bottom Suggestion Area outside the messages flow (Image 3/4 style) */}
            <div className="bg-[#F8FAFC] border-t border-slate-150 p-2.5 sm:p-3 flex flex-col gap-1.5 shrink-0">
              <span className="text-[9px] font-mono tracking-wider text-slate-400 uppercase select-none font-bold px-1 py-0.5">
                Sélectionnez une question :
              </span>
              
              <div className="flex flex-col gap-1 max-h-[140px] sm:max-h-[185px] overflow-y-auto scrollbar-thin">
                {FAQ_DATA.map((faq, idx) => {
                  const isAlreadySelected = messages.some(
                    (m) => m.sender === "user" && m.text === faq.question
                  );
                  return (
                    <button
                      key={idx}
                      disabled={isTyping}
                      onClick={() => handleSelectQuestion(faq.question, faq.answer)}
                      className={`text-left text-[11px] font-sans px-3 py-1.5 rounded transition-all duration-300 outline-none flex items-center justify-between gap-2 group ${
                        isAlreadySelected
                          ? "bg-slate-100/60 text-slate-400 cursor-default border-dashed border-slate-200"
                          : "bg-white border border-slate-200 text-slate-700 hover:bg-[#4B6676] hover:text-white hover:border-[#4B6676] cursor-pointer shadow-xs active:bg-slate-100/50"
                      }`}
                    >
                      <span className="font-normal truncate leading-tight">
                        {faq.question}
                      </span>
                      {!isAlreadySelected && (
                        <span className="text-slate-400 group-hover:text-white transition-colors duration-200 text-[8px] pl-1 opacity-70 font-mono">
                          ▶
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative group w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#8EA1AC] hover:bg-[#8294a0] border border-white/20 flex items-center justify-center transition-all duration-300 shadow-2xl backdrop-blur-md cursor-pointer"
        aria-label="Ouvrir l'assistant"
      >
        <span className="absolute inset-0 rounded-full bg-white/10 group-hover:bg-white/20 animate-pulse transition-colors" />

        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.svg
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="w-4.5 h-4.5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </motion.svg>
          ) : (
            <motion.div
              key="chat"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="flex items-center justify-center"
            >
              <svg
                className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
