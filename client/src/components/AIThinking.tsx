import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BrainCircuit, type LucideIcon } from "lucide-react";

interface Props {
  steps: string[];
  icon?: LucideIcon;
  intervalMs?: number;
}

export default function AIThinking({ steps, icon: Icon = BrainCircuit, intervalMs = 1400 }: Props) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (steps.length <= 1) return;
    const t = setInterval(() => setIdx((i) => Math.min(i + 1, steps.length - 1)), intervalMs);
    return () => clearInterval(t);
  }, [steps.length, intervalMs]);

  return (
    <div className="bg-white max-w-md w-full mx-auto p-8 rounded-3xl shadow-xl border border-blue-100 text-center space-y-5">
      <div className="relative w-20 h-20 mx-auto">
        <div className="absolute inset-0 border-4 border-blue-100 rounded-full" />
        <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <Icon className="absolute inset-0 m-auto w-9 h-9 text-blue-600 animate-pulse" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-3">AI is thinking...</h2>
        <AnimatePresence mode="wait">
          <motion.p
            key={idx}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className="text-sm text-gray-500 min-h-[20px]"
          >
            {steps[idx]}
          </motion.p>
        </AnimatePresence>
      </div>
      <div className="flex items-center justify-center gap-1.5">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all ${
              i === idx ? "w-6 bg-blue-600" : i < idx ? "w-1.5 bg-blue-400" : "w-1.5 bg-blue-100"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
