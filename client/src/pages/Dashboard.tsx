import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useAuth } from "@workspace/replit-auth-web";
import { useQuery } from "@tanstack/react-query";
import { type CareerRecommendation } from "@workspace/api-client-react";
import {
  BrainCircuit,
  History,
  Sparkles,
  Target,
  TrendingUp,
  Calendar,
  ChevronRight,
  Award,
  RotateCcw,
  GraduationCap,
  Swords,
  Wallet,
  Lightbulb,
  Play,
  X,
  ArrowRight,
  Shield,
} from "lucide-react";
import { useQuiz } from "@/context/QuizContext";
import ErrorRetry from "@/components/ErrorRetry";

const QUIZ_PROGRESS_KEY = "quiz_progress_v1";
const TOTAL_QUESTIONS_FALLBACK = 8;

const PRO_TIPS = [
  "Try taking the assessment multiple times with different priorities to discover varied career paths.",
  "Use the Compare tool to weigh two careers head-to-head — including AI replacement risk.",
  "Check the Cost & Scholarships page before finalising any course — government schemes can cover up to 100% fees.",
  "Stream Selector helps class 9-10 students pick Science, Commerce or Arts based on their real interests.",
  "Skill Gap Analysis tells you exactly which skills to learn next for any career.",
];

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

interface Assessment {
  id: number;
  careerTitle: string;
  matchScore: number;
  result: Record<string, unknown> & {
    description?: string;
    salaryRange?: string;
    futureProofScore?: number;
    aiReplacementRisk?: string;
    whyGoodFit?: string;
    keySkills?: string[];
  };
  createdAt: string;
}

function MatchBadge({ score }: { score: number }) {
  const color =
    score >= 85
      ? "text-emerald-600 bg-emerald-50 border-emerald-200"
      : score >= 70
        ? "text-green-800 bg-green-50 border-green-200"
        : "text-amber-600 bg-amber-50 border-amber-200";
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${color}`}
    >
      <Award className="w-3 h-3" /> {score}% Match
    </span>
  );
}

import { authenticatedFetch } from "@/lib/fetch";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { reset, setResult } = useQuiz();
  const [resumeInfo, setResumeInfo] = useState<{
    step: number;
    total: number;
  } | null>(null);
  const [tipIndex, setTipIndex] = useState(0);

  const { data, isLoading, isError, refetch } = useQuery<{
    assessments: Assessment[];
  }>({
    queryKey: ["assessments"],
    queryFn: async () => {
      const res = await authenticatedFetch(`${BASE}/api/assessments`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to load history");
      return res.json();
    },
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(QUIZ_PROGRESS_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        const step = (saved.stepIndex ?? 0) as number;
        const answered = Object.keys(saved.answers ?? {}).length;
        if (step > 0 && answered > 0) {
          setResumeInfo({ step: step + 1, total: TOTAL_QUESTIONS_FALLBACK });
        }
      }
    } catch {
      /* ignore */
    }
    setTipIndex(Math.floor(Math.random() * PRO_TIPS.length));
  }, []);

  const assessments = data?.assessments ?? [];
  const latest = assessments[0];

  const handleStartNew = () => {
    reset();
    try {
      localStorage.removeItem(QUIZ_PROGRESS_KEY);
    } catch {
      /* ignore */
    }
    setResumeInfo(null);
    setLocation("/quiz");
  };

  const handleResume = () => setLocation("/quiz");

  const dismissResume = () => {
    try {
      localStorage.removeItem(QUIZ_PROGRESS_KEY);
    } catch {
      /* ignore */
    }
    setResumeInfo(null);
  };

  const handleViewResult = (assessment: Assessment) => {
    setResult(assessment.result as unknown as CareerRecommendation);
    setLocation("/results");
  };

  const handleCostForLatest = () => {
    if (latest?.careerTitle) {
      setLocation(`/cost?career=${encodeURIComponent(latest.careerTitle)}`);
    } else {
      setLocation("/cost");
    }
  };

  const handleSkillGapForLatest = () => {
    if (latest?.careerTitle) {
      setLocation(
        `/skill-gap?career=${encodeURIComponent(latest.careerTitle)}`,
      );
    } else {
      setLocation("/skill-gap");
    }
  };

  const bestScore = assessments.length
    ? Math.max(...assessments.map((a) => a.matchScore))
    : 0;
  const avgScore = assessments.length
    ? Math.round(
      assessments.reduce((a, b) => a + b.matchScore, 0) / assessments.length,
    )
    : 0;

  return (
    <div className="bg-[#ffffff] min-h-[calc(100vh-4rem)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">
              Welcome back, {user?.firstName ?? "Student"} 👋
            </h1>
            <p className="text-gray-500 mt-1 text-sm">
              {assessments.length > 0
                ? `You've completed ${assessments.length} assessment${assessments.length > 1 ? "s" : ""}. Keep exploring.`
                : "Ready to discover your ideal career path?"}
            </p>
          </div>
          <button
            onClick={handleStartNew}
            className="inline-flex items-center gap-2 bg-green-800  text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg hover:-translate-y-0.5 transition-all text-sm focus-ring"
          >
            <Sparkles className="w-4 h-4" />
            {assessments.length > 0 ? "Take Another" : "Take Assessment"}
          </button>
        </motion.div>

        {/* Resume Quiz Banner */}
        {resumeInfo && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-3"
          >
            <div className="flex items-start gap-3 flex-1">
              <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center shrink-0">
                <Play className="w-5 h-5 text-white" fill="currentColor" />
              </div>
              <div>
                <p className="text-sm font-bold text-amber-900">
                  You have an unfinished quiz
                </p>
                <p className="text-xs text-amber-700 mt-0.5">
                  You're on question {resumeInfo.step} of {resumeInfo.total}.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={dismissResume}
                aria-label="Dismiss"
                className="p-2 text-amber-700 hover:bg-amber-100 rounded-lg focus-ring transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <button
                onClick={handleResume}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold rounded-xl shadow-md focus-ring transition-colors"
              >
                Resume Quiz
              </button>
            </div>
          </motion.div>
        )}

        {isError && (
          <ErrorRetry
            message="Could not load your assessment history."
            onRetry={() => refetch()}
          />
        )}

        {/* HERO ROW: Career Snapshot (left, 2/3) + Stats stack (right, 1/3) */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Career Snapshot */}
          <div className="lg:col-span-2">
            {isLoading ? (
              <div className="bg-white rounded-2xl border border-green-600 shadow-sm p-6 h-full min-h-[260px] animate-pulse">
                <div className="h-4 bg-gray-100 rounded w-32 mb-4" />
                <div className="h-8 bg-gray-100 rounded w-2/3 mb-3" />
                <div className="h-3 bg-gray-100 rounded w-full mb-2" />
                <div className="h-3 bg-gray-100 rounded w-5/6" />
              </div>
            ) : latest ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative bg-white-700 rounded-2xl p-6 sm:p-7 text-black shadow-xl  overflow-hidden h-full min-h-[260px]"
              >
                <div
                  aria-hidden
                  className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl"
                />
                <div
                  aria-hidden
                  className="absolute -bottom-12 -left-12 w-48 h-48 bg-purple-300/20 rounded-full blur-3xl"
                />
                <div className="relative">
                  <p className="text-xs font-bold text-black-100 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Your top career match
                  </p>
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <h2 className="text-2xl sm:text-3xl font-extrabold">
                      {latest.careerTitle}
                    </h2>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-white text-blue-700">
                      <Award className="w-3 h-3" /> {latest.matchScore}% match
                    </span>
                  </div>
                  {latest.result?.whyGoodFit && (
                    <p className="text-sm text-black-50/90 leading-relaxed line-clamp-3 mb-4 max-w-2xl">
                      {latest.result.whyGoodFit}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2 mb-5">
                    {latest.result?.salaryRange && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-black/15 backdrop-blur px-2.5 py-1.5 rounded-lg">
                        <Wallet className="w-3.5 h-3.5" />{" "}
                        {latest.result.salaryRange}
                      </span>
                    )}
                    {typeof latest.result?.futureProofScore === "number" && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-black/15 backdrop-blur px-2.5 py-1.5 rounded-lg">
                        <Shield className="w-3.5 h-3.5" /> Future-proof{" "}
                        {latest.result.futureProofScore}/100
                      </span>
                    )}
                    {latest.result?.aiReplacementRisk && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-black/15 backdrop-blur px-2.5 py-1.5 rounded-lg">
                        <BrainCircuit className="w-3.5 h-3.5" /> AI risk:{" "}
                        {latest.result.aiReplacementRisk}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleViewResult(latest)}
                      className="inline-flex items-center gap-1.5 bg-white text-blue-700 hover:bg-blue-50 font-bold text-sm px-4 py-2 rounded-xl shadow-md focus-ring transition-colors"
                    >
                      View full roadmap <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleSkillGapForLatest}
                      className="inline-flex items-center gap-1.5 bg-black/15 hover:bg-black/25 backdrop-blur text-black font-semibold text-sm px-4 py-2 rounded-xl focus-ring transition-colors"
                    >
                      Skill gap
                    </button>
                    <button
                      onClick={handleCostForLatest}
                      className="inline-flex items-center gap-1.5 bg-black/15 hover:bg-black/25 backdrop-blur text-black font-semibold text-sm px-4 py-2 rounded-xl focus-ring transition-colors"
                    >
                      Cost & aid
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6 sm:p-8 h-full min-h-[260px] flex flex-col"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                  <BrainCircuit className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-xl font-extrabold text-gray-900 mb-1.5">
                  Start with a 2-minute assessment
                </h2>
                <p className="text-sm text-gray-500 max-w-lg leading-relaxed mb-5">
                  Answer 8 questions and our AI builds a personalized career
                  match, future-proof score, and a 5-stage roadmap tuned for
                  Indian students.
                </p>
                <ol className="grid grid-cols-3 gap-3 mb-5">
                  {[
                    { n: 1, label: "Answer 8 Qs", icon: Sparkles },
                    { n: 2, label: "AI matches you", icon: BrainCircuit },
                    { n: 3, label: "Get a roadmap", icon: Target },
                  ].map(({ n, label, icon: Icon }) => (
                    <li
                      key={n}
                      className="flex flex-col items-center text-center gap-1.5 p-3 rounded-xl bg-blue-50/60 border border-blue-100"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                        {n}
                      </div>
                      <Icon className="w-4 h-4 text-blue-600" />
                      <span className="text-[11px] font-semibold text-gray-700 leading-tight">
                        {label}
                      </span>
                    </li>
                  ))}
                </ol>
                <button
                  onClick={handleStartNew}
                  className="self-start inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow-md focus-ring transition-colors"
                >
                  <Sparkles className="w-4 h-4" /> Start your first assessment
                </button>
              </motion.div>
            )}
          </div>

          {/* Stats stack (right) */}
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
            {[
              {
                icon: History,
                label: "Assessments",
                value: assessments.length,
                color: "blue",
              },
              {
                icon: Award,
                label: "Best match",
                value: bestScore ? `${bestScore}%` : "—",
                color: "emerald",
              },
              {
                icon: TrendingUp,
                label: "Avg match",
                value: avgScore ? `${avgScore}%` : "—",
                color: "amber",
              },
            ].map(({ icon: Icon, label, value, color }) => (
              <div
                key={label}
                className={`bg-white rounded-2xl border border-${color}-100 shadow-sm p-4 flex items-center gap-3`}
              >
                <div
                  className={`w-10 h-10 rounded-xl bg-${color}-50 flex items-center justify-center shrink-0`}
                >
                  <Icon className={`w-5 h-5 text-${color}-600`} />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                    {label}
                  </p>
                  <p className="text-xl font-extrabold text-gray-900 truncate">
                    {value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* MAIN ROW: History + Quick Actions */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Assessment History */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-blue-100 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-50">
                <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <History className="w-4 h-4 text-blue-600" />
                  Assessment History
                </h2>
                {assessments.length > 0 && (
                  <span className="text-xs text-gray-400">
                    {assessments.length} total
                  </span>
                )}
              </div>

              {isLoading ? (
                <ul className="divide-y divide-gray-50">
                  {[1, 2, 3].map((i) => (
                    <li
                      key={i}
                      className="flex items-center gap-4 px-5 py-3.5 animate-pulse"
                    >
                      <div className="w-9 h-9 bg-gray-100 rounded-xl shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3.5 bg-gray-100 rounded w-1/2" />
                        <div className="h-3 bg-gray-100 rounded w-1/3" />
                      </div>
                    </li>
                  ))}
                </ul>
              ) : assessments.length === 0 ? (
                <div className="p-8 text-center">
                  <BrainCircuit className="w-10 h-10 text-blue-200 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium text-sm">
                    No assessments yet
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Take your first assessment to see it here.
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-50">
                  {assessments.map((a, i) => (
                    <motion.li
                      key={a.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors group cursor-pointer"
                      onClick={() => handleViewResult(a)}
                    >
                      <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center shrink-0 text-blue-600 font-bold text-sm">
                        {assessments.length - i}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate text-sm">
                          {a.careerTitle}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <MatchBadge score={a.matchScore} />
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(a.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors shrink-0" />
                    </motion.li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-5">
              <h2 className="text-sm font-bold text-gray-900 mb-3">
                Explore tools
              </h2>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  {
                    onClick: () => setLocation("/stream-selector"),
                    accent: "indigo",
                    icon: GraduationCap,
                    title: "Stream Selector",
                    desc: "Class 9-10",
                  },
                  {
                    onClick: () => setLocation("/compare"),
                    accent: "pink",
                    icon: Swords,
                    title: "Compare",
                    desc: "Side-by-side",
                  },
                  {
                    onClick: handleCostForLatest,
                    accent: "emerald",
                    icon: Wallet,
                    title: "Cost & Aid",
                    desc: "Fees & loans",
                  },
                  {
                    onClick: handleSkillGapForLatest,
                    accent: "purple",
                    icon: Target,
                    title: "Skill Gap",
                    desc: "What to learn",
                  },
                  ...(latest
                    ? [
                      {
                        onClick: () => handleViewResult(latest),
                        accent: "amber" as const,
                        icon: RotateCcw,
                        title: "Last Result",
                        desc: latest.careerTitle,
                      },
                    ]
                    : []),
                  {
                    onClick: () => setLocation("/profile"),
                    accent: "blue",
                    icon: Award,
                    title: "Profile",
                    desc: "Saved & history",
                  },
                ].map((q) => {
                  const accentMap: Record<
                    string,
                    {
                      border: string;
                      bg: string;
                      text: string;
                      hoverBorder: string;
                      hoverBg: string;
                    }
                  > = {
                    blue: {
                      border: "border-blue-100",
                      bg: "bg-blue-100",
                      text: "text-blue-600",
                      hoverBorder: "hover:border-blue-500",
                      hoverBg: "hover:bg-blue-50",
                    },
                    indigo: {
                      border: "border-indigo-100",
                      bg: "bg-indigo-100",
                      text: "text-indigo-600",
                      hoverBorder: "hover:border-indigo-500",
                      hoverBg: "hover:bg-indigo-50",
                    },
                    pink: {
                      border: "border-pink-100",
                      bg: "bg-pink-100",
                      text: "text-pink-600",
                      hoverBorder: "hover:border-pink-500",
                      hoverBg: "hover:bg-pink-50",
                    },
                    emerald: {
                      border: "border-emerald-100",
                      bg: "bg-emerald-100",
                      text: "text-emerald-600",
                      hoverBorder: "hover:border-emerald-500",
                      hoverBg: "hover:bg-emerald-50",
                    },
                    purple: {
                      border: "border-purple-100",
                      bg: "bg-purple-100",
                      text: "text-purple-600",
                      hoverBorder: "hover:border-purple-500",
                      hoverBg: "hover:bg-purple-50",
                    },
                    amber: {
                      border: "border-amber-100",
                      bg: "bg-amber-100",
                      text: "text-amber-600",
                      hoverBorder: "hover:border-amber-500",
                      hoverBg: "hover:bg-amber-50",
                    },
                  };
                  const c = accentMap[q.accent];
                  const Icon = q.icon;
                  return (
                    <button
                      key={q.title}
                      onClick={q.onClick}
                      className={`min-h-[112px] flex flex-col justify-between gap-2 p-3 rounded-xl border-2 ${c.border} ${c.hoverBorder} ${c.hoverBg} transition-all text-left focus-ring active:scale-[0.98]`}
                    >
                      <div
                        className={`w-8 h-8 ${c.bg} rounded-lg flex items-center justify-center shrink-0`}
                      >
                        <Icon className={`w-4 h-4 ${c.text}`} />
                      </div>
                      <div className="min-w-0 w-full">
                        <p className="text-sm font-bold text-gray-800 leading-tight line-clamp-2">
                          {q.title}
                        </p>
                        <p className="text-[11px] text-gray-500 truncate mt-0.5">
                          {q.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Pro Tip */}
            <div className="bg-[#ffffff] rounded-2xl p-5 text-black shadow-lg shadow-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="w-4 h-4 text-amber-300" />
                <h3 className="font-bold text-sm">Pro Tip</h3>
              </div>
              <p className="text-xs text-black-200 leading-relaxed">
                {PRO_TIPS[tipIndex]}
              </p>
              <button
                onClick={() => setTipIndex((i) => (i + 1) % PRO_TIPS.length)}
                className="mt-3 text-xs font-bold text-black/90 hover:text-white underline underline-offset-2 focus-ring rounded"
              >
                Next tip →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
