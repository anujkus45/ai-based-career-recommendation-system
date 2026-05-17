import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BrainCircuit, GraduationCap, Sparkles, Target, ChevronRight, Check } from "lucide-react";
import { authenticatedFetch } from "@/lib/fetch";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

const CLASS_OPTIONS = [
  { value: "9-10", label: "Class 9-10", hint: "Choosing a stream" },
  { value: "11-12", label: "Class 11-12", hint: "Picking a degree" },
  { value: "ug", label: "Undergraduate", hint: "Building skills" },
  { value: "grad", label: "Graduated", hint: "Switching careers" },
];

const INTEREST_CHIPS = [
  "Coding", "Design", "Data & AI", "Medicine", "Business", "Finance",
  "Law", "Teaching", "Civil Services", "Engineering", "Media", "Sports",
];

interface ProfileResponse {
  profile: { hasCompletedOnboarding: boolean; classLevel?: string | null; interests?: string[] | null } | null;
}

export default function OnboardingModal() {
  const qc = useQueryClient();
  const [step, setStep] = useState(0);
  const [classLevel, setClassLevel] = useState<string>("");
  const [interests, setInterests] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  const { data, isLoading } = useQuery<ProfileResponse>({
    queryKey: ["profile"],
    queryFn: async () => {
      const r = await authenticatedFetch(`${BASE}/api/profile`, { credentials: "include" });
      if (!r.ok) throw new Error("profile fetch failed");
      return r.json();
    },
    staleTime: 60_000,
  });

  useEffect(() => {
    if (isLoading) return;
    const p = data?.profile;
    if (!p || p.hasCompletedOnboarding === false) setOpen(true);
  }, [data, isLoading]);

  const save = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const r = await authenticatedFetch(`${BASE}/api/profile`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!r.ok) throw new Error("save failed");
      return r.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile"] });
    },
  });

  const toggleInterest = (i: string) => {
    setInterests((prev) => (prev.includes(i) ? prev.filter((x) => x !== i) : prev.length >= 6 ? prev : [...prev, i]));
  };

  const finish = async () => {
    await save.mutateAsync({ classLevel, interests, hasCompletedOnboarding: true });
    setOpen(false);
  };

  const skip = async () => {
    await save.mutateAsync({ hasCompletedOnboarding: true });
    setOpen(false);
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
      >
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 30, opacity: 0 }}
          className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden"
          role="dialog"
          aria-modal="true"
        >
          {/* Progress dots */}
          <div className="flex items-center gap-1.5 px-6 pt-5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${i === step ? "bg-blue-600 w-8" : i < step ? "bg-blue-300 w-4" : "bg-gray-200 w-4"}`}
              />
            ))}
            <button onClick={skip} className="ml-auto text-xs font-medium text-gray-400 hover:text-gray-600 focus-ring rounded">
              Skip
            </button>
          </div>

          <div className="px-6 pt-5 pb-6 sm:px-8 sm:pb-7">
            {step === 0 && (
              <>
                <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mb-4">
                  <BrainCircuit className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-2xl font-extrabold text-gray-900">Welcome aboard 👋</h2>
                <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                  In 2 minutes you'll get a personalized career recommendation, a 5-step roadmap, and salary + scholarship insights — all tuned for Indian students.
                </p>
                <ul className="mt-5 space-y-3">
                  {[
                    { icon: Sparkles, text: "Answer 8 quick questions" },
                    { icon: BrainCircuit, text: "GPT-4o builds your match" },
                    { icon: Target, text: "Get a step-by-step roadmap" },
                  ].map(({ icon: Icon, text }, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
                        <Icon className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="text-sm text-gray-700 font-medium">{text}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {step === 1 && (
              <>
                <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center mb-4">
                  <GraduationCap className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-2xl font-extrabold text-gray-900">Where are you right now?</h2>
                <p className="text-sm text-gray-500 mt-1.5">This helps tailor your roadmap.</p>
                <div className="grid grid-cols-2 gap-2.5 mt-5">
                  {CLASS_OPTIONS.map((o) => {
                    const selected = classLevel === o.value;
                    return (
                      <button
                        key={o.value}
                        onClick={() => setClassLevel(o.value)}
                        className={`text-left p-3.5 rounded-xl border-2 transition-all focus-ring ${selected ? "border-blue-600 bg-blue-50" : "border-gray-200 hover:border-blue-300"}`}
                      >
                        <p className="font-bold text-sm text-gray-900">{o.label}</p>
                        <p className="text-[11px] text-gray-500 mt-0.5">{o.hint}</p>
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="w-14 h-14 bg-purple-600 rounded-2xl flex items-center justify-center mb-4">
                  <Target className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-2xl font-extrabold text-gray-900">Pick a few interests</h2>
                <p className="text-sm text-gray-500 mt-1.5">Choose up to 6 — we use these to personalize recommendations.</p>
                <div className="flex flex-wrap gap-2 mt-5">
                  {INTEREST_CHIPS.map((chip) => {
                    const selected = interests.includes(chip);
                    return (
                      <button
                        key={chip}
                        onClick={() => toggleInterest(chip)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border-2 transition-all focus-ring inline-flex items-center gap-1.5 ${selected ? "border-blue-600 bg-blue-600 text-white" : "border-gray-200 bg-white text-gray-700 hover:border-blue-300"}`}
                      >
                        {selected && <Check className="w-3 h-3" />} {chip}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Footer buttons */}
          <div className="px-6 pb-6 sm:px-8 sm:pb-7 flex items-center justify-between gap-3 border-t border-gray-100 pt-4">
            <button
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="text-sm font-semibold text-gray-500 hover:text-gray-800 disabled:opacity-0 focus-ring rounded px-2 py-1"
            >
              Back
            </button>
            {step < 2 ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                disabled={step === 1 && !classLevel}
                className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-md focus-ring transition-colors"
              >
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={finish}
                disabled={save.isPending}
                className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-md focus-ring transition-colors"
              >
                {save.isPending ? "Saving..." : "Get started"} <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
