import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ScanLine, Leaf } from 'lucide-react';

interface SplashScreenProps {
  isAppReady: boolean;
  onAnimationComplete: () => void;
}

export function SplashScreen({ isAppReady, onAnimationComplete }: SplashScreenProps) {
  const [progress, setProgress] = useState(0);
  const progressRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const animate = () => {
      // Define o alvo baseado no estado da app
      // Se não estiver pronta, o alvo é 85% (simula carregamento)
      // Se estiver pronta, o alvo é 100%
      const target = isAppReady ? 100 : 85;
      
      // Velocidade da animação
      // Se estiver pronta, vai rápido para 100. Se não, vai devagar.
      const speed = isAppReady ? 2.5 : 0.2;

      // Interpolação suave
      if (progressRef.current < target) {
        progressRef.current += speed;
        // Garante que não ultrapassa o alvo se não estiver pronto
        if (!isAppReady && progressRef.current > 85) {
          progressRef.current = 85;
        }
        if (progressRef.current > 100) {
          progressRef.current = 100;
        }
        setProgress(progressRef.current);
      }

      // Se chegou a 100% e a app está pronta, finaliza
      if (progressRef.current >= 100 && isAppReady) {
        // Pequeno delay para o usuário ver a barra cheia antes de sair
        setTimeout(() => {
          onAnimationComplete();
        }, 500);
        return; // Para a animação
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isAppReady, onAnimationComplete]);

  return (
    <motion.div 
      className="fixed inset-0 bg-white z-[100] flex flex-col items-center justify-center"
      exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
    >
      <div className="relative flex flex-col items-center justify-center mb-12">
        {/* Logo Container */}
        <div className="relative mb-6">
          {/* Ícone de Scan (Borda) */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-emerald-500"
          >
            <ScanLine size={80} strokeWidth={2.5} />
          </motion.div>

          {/* Ícone de Folha (Centro) */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="absolute inset-0 flex items-center justify-center text-emerald-600"
          >
            <Leaf size={32} fill="currentColor" strokeWidth={0} />
          </motion.div>

          {/* Efeito de Scan (Linha passando) */}
          <motion.div
            className="absolute left-0 right-0 h-0.5 bg-emerald-400/50 shadow-[0_0_10px_rgba(52,211,153,0.8)]"
            initial={{ top: "10%" }}
            animate={{ top: ["10%", "90%", "10%"] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
          />
        </div>

        {/* Texto Logo */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex items-center gap-1"
        >
          <span className="text-4xl font-bold text-gray-900 tracking-tight">Scan</span>
          <span className="text-4xl font-bold text-emerald-600 tracking-tight">IA</span>
        </motion.div>
      </div>

      {/* Barra de Progresso */}
      <div className="w-64 space-y-3">
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden w-full">
          <motion.div 
            className="h-full bg-emerald-500 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest h-4">
          <span>{progress < 100 ? "A carregar..." : "Pronto"}</span>
          <span>{Math.round(progress)}%</span>
        </div>
      </div>
    </motion.div>
  );
}
