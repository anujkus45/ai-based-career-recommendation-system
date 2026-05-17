import { BrainCircuit } from "lucide-react";
import { useLocation } from "wouter";

const TOOLS: Array<{ label: string; path: string }> = [
  { label: "Assessment", path: "/quiz" },
  { label: "Stream Selector", path: "/stream-selector" },
  { label: "Compare Careers", path: "/compare" },
  { label: "Cost & Aid", path: "/cost" },
  { label: "Skill Gap", path: "/skill-gap" },
];

const ACCOUNT: Array<{ label: string; path: string }> = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Profile", path: "/profile" },
];

export default function Footer() {
  const [, setLocation] = useLocation();
  return (
    <footer className="w-full bg-white text-black mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-start">
          <div className="col-span-2 md:col-span-2">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-7 h-7 bg-white/250 rounded-lg flex items-center justify-center">
                <BrainCircuit className="w-4 h-4 text-black" />
              </div>
              <p className="text-sm font-bold">
                AI Career Recommendation System
              </p>
            </div>
            <p className="text-xs text-black/200 leading-relaxed max-w-md">
              Built for Indian students — GPT-4o powered guidance on careers,
              streams, colleges, and scholarships.
            </p>
          </div>
          <div>
            <h4 className="text-[10px] font-bold text-black/250 uppercase tracking-widest mb-2">
              Tools
            </h4>
            <ul className="space-y-1">
              {TOOLS.map((t) => (
                <li key={t.path}>
                  <button
                    onClick={() => setLocation(t.path)}
                    className="text-xs text-black/250 hover:text-gray-700 font-medium focus-ring rounded"
                  >
                    {t.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-[10px] font-bold text-black/250 uppercase tracking-widest mb-2">
              Account
            </h4>
            <ul className="space-y-1">
              {ACCOUNT.map((t) => (
                <li key={t.path}>
                  <button
                    onClick={() => setLocation(t.path)}
                    className="text-xs text-black/250 hover:text-gray-700 font-medium focus-ring rounded"
                  >
                    {t.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-white/50 flex flex-col sm:flex-row items-center justify-between gap-1 text-[11px] text-black/60">
          <p>
            &copy; {new Date().getFullYear()} AI Career Recommendation System
          </p>
          <p>Made for Indian students · Powered by GPT-4o</p>
        </div>
      </div>
    </footer>
  );
}
