import { Sparkles } from "lucide-react";
import { useLocation } from "wouter";

export default function MobileQuickActionBar() {
  const [location, setLocation] = useLocation();

  // Hide on dashboard (already has prominent CTA), quiz, results, and login
  if (
    location === "/" ||
    location === "/dashboard" ||
    location === "/profile" ||
    location.startsWith("/quiz") ||
    location === "/results"
  ) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-white/95 backdrop-blur-md border-t border-blue-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] p-3 safe-bottom">
      <button
        onClick={() => setLocation("/quiz")}
        className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-3 px-5 rounded-xl shadow-md focus-ring transition-colors text-sm"
      >
        <Sparkles className="w-4 h-4" />
        Take the Career Assessment
      </button>
    </div>
  );
}
