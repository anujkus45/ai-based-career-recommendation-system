import { ChevronLeft } from "lucide-react";
import { useLocation } from "wouter";

interface Props {
  current: string;
}

export default function Breadcrumb({ current }: Props) {
  const [, setLocation] = useLocation();
  return (
    <div className="bg-white/70 backdrop-blur-sm border-b border-blue-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-11 flex items-center text-sm">
        <button
          onClick={() => setLocation("/dashboard")}
          className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-semibold focus-ring rounded-md px-1"
        >
          <ChevronLeft className="w-4 h-4" /> Dashboard
        </button>
        <span className="text-gray-300 mx-2">/</span>
        <span className="text-gray-700 font-semibold truncate">{current}</span>
      </div>
    </div>
  );
}
