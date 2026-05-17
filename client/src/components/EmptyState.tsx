import { motion } from "framer-motion";
import { type LucideIcon } from "lucide-react";

interface Props {
  icon: LucideIcon;
  title: string;
  description: string;
  hints?: string[];
}

export default function EmptyState({ icon: Icon, title, description, hints }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/60 border-2 border-dashed border-blue-200 rounded-2xl p-8 sm:p-10 text-center"
    >
      <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-100 rounded-2xl mb-4">
        <Icon className="w-7 h-7 text-blue-500" />
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-1.5">{title}</h3>
      <p className="text-sm text-gray-500 max-w-md mx-auto leading-relaxed">{description}</p>
      {hints && hints.length > 0 && (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {hints.map((h, i) => (
            <span key={i} className="text-xs px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-full font-medium">
              {h}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}
