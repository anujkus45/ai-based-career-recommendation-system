import { useState, useEffect } from "react";
import { authenticatedFetch } from "@/lib/fetch";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import Breadcrumb from "@/components/Breadcrumb";
import {
  GraduationCap, BookOpen, ChevronRight, ChevronLeft, Sparkles,
  CheckCircle2, AlertTriangle, Target, Award, RotateCcw, Home
} from "lucide-react";

interface StreamQuestion {
  id: string;
  question: string;
  options: { value: string; label: string }[];
}

interface StreamResult {
  recommendedStream: string;
  matchScore: number;
  subjectsToPick: string[];
  reasoning: string;
  topCareers: string[];
  entranceExams: string[];
  alternativeStream: { name: string; matchScore: number; reasoning: string };
  warnings: string[];
  actionPlan: string[];
}

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

const STREAM_COLORS: Record<string, { bg: string; text: string; light: string }> = {
  Science: { bg: "from-blue-500 to-cyan-600", text: "text-blue-700", light: "bg-blue-50" },
  Commerce: { bg: "from-amber-500 to-orange-600", text: "text-amber-700", light: "bg-amber-50" },
  "Arts/Humanities": { bg: "from-purple-500 to-pink-600", text: "text-purple-700", light: "bg-purple-50" },
};

export default function StreamSelector() {
  const [, setLocation] = useLocation();
  const [questions, setQuestions] = useState<StreamQuestion[]>([]);
  const [step, setStep] = useState<"intro" | "quiz" | "loading" | "result">("intro");
  const [stepIdx, setStepIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<StreamResult | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    fetch(`${BASE}/api/stream/questions`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setQuestions(d.questions ?? []))
      .catch(() => setError("Could not load questions"));
  }, []);

  const submit = async (final: Record<string, string>) => {
    setStep("loading");
    setError("");
    try {
      const res = await fetch(`${BASE}/api/stream/recommend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          answers: Object.entries(final).map(([questionId, answer]) => ({ questionId, answer })),
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      setResult(await res.json());
      setStep("result");
    } catch {
      setError("Something went wrong. Please try again.");
      setStep("quiz");
    }
  };

  const select = (qid: string, val: string) => {
    const next = { ...answers, [qid]: val };
    setAnswers(next);
    if (stepIdx < questions.length - 1) {
      setTimeout(() => setStepIdx((i) => i + 1), 300);
    } else {
      setTimeout(() => submit(next), 300);
    }
  };

  /* ── INTRO ── */
  if (step === "intro") {
    return (
      <div className="bg-[#EEF4FF] min-h-[calc(100vh-4rem)]">
        <Breadcrumb current="Stream Selector" />
        <div className="flex items-center justify-center p-4 min-h-[calc(100vh-7rem)]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white max-w-2xl w-full rounded-3xl shadow-xl border border-blue-100 p-10 text-center"
          >
            <div className="w-20 h-20 bg-[#7f7f7f] rounded-3xl mx-auto flex items-center justify-center mb-6 shadow-lg shadow-blue-200">
              <GraduationCap className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
              Stream Selector for Class 11-12
            </h1>
            <p className="text-gray-500 text-lg mb-8 max-w-lg mx-auto">
              Confused between Science, Commerce, or Arts? Answer 5 quick questions and let AI recommend the best stream for you.
            </p>
            <div className="grid grid-cols-3 gap-3 mb-8">
              {Object.keys(STREAM_COLORS).map((s) => (
                <div key={s} className={`${STREAM_COLORS[s].light} rounded-xl p-4 border border-gray-100`}>
                  <BookOpen className={`w-6 h-6 ${STREAM_COLORS[s].text} mx-auto mb-2`} />
                  <p className={`font-bold text-sm ${STREAM_COLORS[s].text}`}>{s}</p>
                </div>
              ))}
            </div>
            <button
              onClick={() => setStep("quiz")}
              disabled={questions.length === 0}
              className="inline-flex items-center gap-2 bg-[#7f7f7f] hover:bg-blue-700 disabled:bg-gray-300 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg shadow-blue-200 hover:-translate-y-0.5 transition-all"
            >
              <Sparkles className="w-4 h-4" /> Start the Quiz
            </button>
            {error && <p className="text-sm text-red-500 mt-3">{error}</p>}
          </motion.div>
        </div>
      </div>
    );
  }

  /* ── LOADING ── */
  if (step === "loading") {
    return (
      <div className="bg-[#EEF4FF] min-h-[calc(100vh-4rem)]">
        <Breadcrumb current="Stream Selector" />
        <div className="flex items-center justify-center p-4 min-h-[calc(100vh-7rem)]">
          <div className="bg-white max-w-md w-full rounded-3xl shadow-xl p-10 text-center space-y-5">
            <div className="relative w-20 h-20 mx-auto">
              <div className="absolute inset-0 border-4 border-blue-100 rounded-full" />
              <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <GraduationCap className="absolute inset-0 m-auto w-9 h-9 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Analyzing your interests...</h2>
            <p className="text-sm text-gray-400">AI is matching you with the best stream for class 11-12.</p>
          </div>
        </div>
      </div>
    );
  }

  /* ── RESULT ── */
  if (step === "result" && result) {
    const colors = STREAM_COLORS[result.recommendedStream] ?? STREAM_COLORS["Science"];
    return (
      <div className="bg-[#EEF4FF] min-h-[calc(100vh-4rem)] pb-20">
        <Breadcrumb current="Stream Selector — Result" />
        {/* Hero */}
        <div className={`bg-gradient-to-r ${colors.bg} text-white px-4 py-12 text-center`}>
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-bold mb-4 border border-white/30">
              <Award className="w-4 h-4" /> {result.matchScore}% Match
            </div>
            <p className="text-white/80 text-sm uppercase tracking-widest mb-2">Recommended Stream</p>
            <h1 className="text-5xl md:text-6xl font-black mb-4">{result.recommendedStream}</h1>
            <p className="text-lg text-white/90 max-w-2xl mx-auto">{result.reasoning}</p>
          </motion.div>
        </div>

        <div className="max-w-5xl mx-auto px-4 -mt-6 space-y-6">
          {/* Subjects + Exams */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-100">
              <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600" /> Subjects to Pick
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.subjectsToPick.map((s, i) => (
                  <span key={i} className={`px-3 py-1.5 ${colors.light} ${colors.text} rounded-lg text-sm font-semibold border border-current/10`}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-100">
              <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Target className="w-4 h-4 text-purple-600" /> Entrance Exams to Target
              </h3>
              <ul className="space-y-2">
                {result.entranceExams.map((e, i) => (
                  <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="text-purple-500 font-bold mt-0.5">•</span> {e}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Top Careers */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-100">
            <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" /> Top Career Options for You
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {result.topCareers.map((c, i) => (
                <div key={i} className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-3 text-center">
                  <p className="text-sm font-bold text-gray-800">{c}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Action Plan + Warnings */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-100">
              <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Your Action Plan
              </h3>
              <ol className="space-y-3">
                {result.actionPlan.map((a, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                    <span className="w-6 h-6 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold text-xs shrink-0">{i + 1}</span>
                    {a}
                  </li>
                ))}
              </ol>
            </div>
            <div className="bg-amber-50 rounded-2xl p-6 shadow-sm border border-amber-200">
              <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" /> Things to Avoid
              </h3>
              <ul className="space-y-2">
                {result.warnings.map((w, i) => (
                  <li key={i} className="text-sm text-amber-900 flex items-start gap-2">
                    <span className="text-amber-600 font-bold mt-0.5">⚠</span> {w}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Alternative */}
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 border border-gray-200">
            <p className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-1">Backup Option</p>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {result.alternativeStream.name}{" "}
              <span className="text-base font-semibold text-gray-400">— {result.alternativeStream.matchScore}% match</span>
            </h3>
            <p className="text-sm text-gray-600">{result.alternativeStream.reasoning}</p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <button
              onClick={() => setLocation("/dashboard")}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-md hover:bg-blue-700 transition-all"
            >
              <Home className="w-4 h-4" /> Dashboard
            </button>
            <button
              onClick={() => { setStep("intro"); setStepIdx(0); setAnswers({}); setResult(null); }}
              className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:border-blue-400 hover:text-blue-600 transition-all"
            >
              <RotateCcw className="w-4 h-4" /> Retake Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── QUIZ ── */
  const q = questions[stepIdx];
  if (!q) return null;
  const progress = ((stepIdx + 1) / questions.length) * 100;

  return (
    <div className="bg-[#EEF4FF] min-h-[calc(100vh-4rem)]">
      <Breadcrumb current="Stream Selector — Quiz" />
      <div className="p-4 md:p-8">
        <div className="max-w-3xl mx-auto">
          <header className="mb-8 mt-2">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-blue-600 tracking-widest uppercase">
                Question {stepIdx + 1} of {questions.length}
              </span>
              <button
                onClick={() => stepIdx > 0 ? setStepIdx(stepIdx - 1) : setStep("intro")}
                className="text-xs font-medium text-gray-400 hover:text-gray-600 flex items-center gap-1"
              >
                <ChevronLeft className="w-3 h-3" /> Back
              </button>
            </div>
            <div className="h-2 w-full bg-blue-100 rounded-full overflow-hidden">
              <motion.div className="h-full bg-blue-600 rounded-full" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }} />
            </div>
          </header>

          <AnimatePresence mode="wait">
            <motion.div
              key={stepIdx}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">{q.question}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {q.options.map((o) => {
                  const selected = answers[q.id] === o.value;
                  return (
                    <button
                      key={o.value}
                      onClick={() => select(q.id, o.value)}
                      className={`p-5 rounded-2xl border-2 text-left transition-all group ${selected ? "border-blue-600 bg-blue-50" : "border-blue-100 bg-white hover:border-blue-400 hover:-translate-y-0.5 shadow-sm hover:shadow-md"
                        }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className={`text-base font-medium ${selected ? "text-blue-700" : "text-gray-700 group-hover:text-blue-600"}`}>
                          {o.label}
                        </span>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${selected ? "border-blue-600 bg-blue-600" : "border-gray-300"}`}>
                          {selected && <div className="w-2 h-2 bg-white rounded-full" />}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
