import React, { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import Breadcrumb from "@/components/Breadcrumb";
import {
  Target,
  Search,
  ChevronRight,
  Zap,
  BookOpen,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Clock,
} from "lucide-react";

interface SkillRequirement {
  name: string;
  requiredLevel: number;
  description: string;
  category: string;
}

interface SkillGapItem {
  name: string;
  currentLevel: number;
  requiredLevel: number;
  gap: number;
  priority: string;
  resources: string[];
}

interface LearningPhase {
  phase: number;
  title: string;
  duration: string;
  skills: string[];
  actions: string[];
}

interface SkillGapAnalysis {
  careerGoal: string;
  overallReadiness: number;
  estimatedTime: string;
  skills: SkillGapItem[];
  roadmap: LearningPhase[];
}

const POPULAR_CAREERS = [
  "Data Scientist",
  "Software Engineer",
  "Doctor (MBBS)",
  "IAS Officer (UPSC)",
  "CA (Chartered Accountant)",
  "UX Designer",
  "Product Manager",
  "ML Engineer",
  "Lawyer",
  "Investment Banker",
  "Architect",
  "Game Developer",
];

const PRIORITY_COLOR: Record<string, string> = {
  High: "text-red-600 bg-red-50 border-red-200",
  Medium: "text-amber-600 bg-amber-50 border-amber-200",
  Low: "text-green-600 bg-green-50 border-green-200",
};

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

import { authenticatedFetch } from "@/lib/fetch";

async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await authenticatedFetch(`${BASE}/api${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    credentials: "include",
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as T;
}

type Step = "goal" | "skills" | "results";

export default function SkillGap() {
  const [, setLocation] = useLocation();

  const [step, setStep] = useState<Step>("goal");
  const [careerGoal, setCareerGoal] = useState("");
  const [careerInput, setCareerInput] = useState("");
  const [skillsList, setSkillsList] = useState<SkillRequirement[]>([]);
  const [currentLevels, setCurrentLevels] = useState<Record<string, number>>({});
  const [analysis, setAnalysis] = useState<SkillGapAnalysis | null>(null);
  const [isLoadingSkills, setIsLoadingSkills] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedPhase, setExpandedPhase] = useState<number | null>(0);

  const handleCareerSubmit = async (goal: string) => {
    setCareerGoal(goal);
    setCareerInput(goal);
    setError(null);
    setIsLoadingSkills(true);
    try {
      const data = await apiPost<{ skills: SkillRequirement[] }>(
        "/skill-gap/get-skills",
        { careerGoal: goal }
      );
      setSkillsList(data.skills);
      const levels: Record<string, number> = {};
      data.skills.forEach((s) => (levels[s.name] = 50));
      setCurrentLevels(levels);
      setStep("skills");
    } catch {
      setError("Could not load skills for that career. Please try again.");
    } finally {
      setIsLoadingSkills(false);
    }
  };

  const handleAnalyze = async () => {
    setError(null);
    setIsAnalyzing(true);
    try {
      const currentSkills = skillsList.map((s) => ({
        name: s.name,
        currentLevel: currentLevels[s.name] ?? 50,
        requiredLevel: s.requiredLevel,
      }));
      const data = await apiPost<SkillGapAnalysis>("/skill-gap/analyze", {
        careerGoal,
        currentSkills,
      });
      setAnalysis(data);
      setStep("results");
    } catch {
      setError("Analysis failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const readinessColor = (r: number) =>
    r >= 75 ? "text-green-600" : r >= 50 ? "text-amber-600" : "text-red-600";

  const readinessBg = (r: number) =>
    r >= 75 ? "from-green-500 to-emerald-400" : r >= 50 ? "from-amber-500 to-yellow-400" : "from-red-500 to-orange-400";

  return (
    <div className="bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 min-h-[calc(100vh-4rem)]">
      {/* Sub-navigation breadcrumb */}
      <div className="bg-white/60 backdrop-blur border-b border-gray-100 px-4 py-2.5">
        <div className="max-w-3xl mx-auto flex items-center gap-2 text-sm">
          <button
            onClick={() => setLocation("/")}
            className="text-gray-400 hover:text-indigo-600 transition-colors font-medium"
          >
            Home
          </button>
          <span className="text-gray-300">/</span>
          {step !== "goal" && (
            <>
              <button
                onClick={() => setStep("goal")}
                className="text-gray-400 hover:text-indigo-600 transition-colors font-medium"
              >
                Career Goal
              </button>
              <span className="text-gray-300">/</span>
            </>
          )}
          {step === "results" && (
            <>
              <button
                onClick={() => setStep("skills")}
                className="text-gray-400 hover:text-indigo-600 transition-colors font-medium"
              >
                Skills
              </button>
              <span className="text-gray-300">/</span>
            </>
          )}
          <span className="text-indigo-600 font-semibold">
            {step === "goal" ? "Skill Gap Analysis" : step === "skills" ? "Rate Your Skills" : "Your Analysis"}
          </span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">

          {/* ── STEP 1: Career Goal ── */}
          {step === "goal" && (
            <motion.div
              key="goal"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              className="space-y-8"
            >
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-[#7f7f7f] rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-extrabold text-gray-900">Skill Gap Analysis</h1>
                <p className="text-gray-500 text-base">
                  Tell us your career goal — AI will show where you stand and what to learn next.
                </p>
              </div>

              {/* Input */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
                <label className="block text-sm font-semibold text-gray-700">
                  Apna Career Goal Type Karo
                </label>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={careerInput}
                      onChange={(e) => setCareerInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && careerInput.trim() && handleCareerSubmit(careerInput.trim())}
                      placeholder="e.g. Data Scientist, Doctor, IAS Officer..."
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black text-sm"
                    />
                  </div>
                  <button
                    onClick={() => careerInput.trim() && handleCareerSubmit(careerInput.trim())}
                    disabled={!careerInput.trim() || isLoadingSkills}
                    className="px-5 py-3 bg-[#7f7f7f] hover:bg-black text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
                  >
                    {isLoadingSkills ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>Start <ChevronRight className="w-4 h-4" /></>
                    )}
                  </button>
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
              </div>

              {/* Popular careers */}
              <div className="space-y-3">
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Popular Choices</p>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_CAREERS.map((c) => (
                    <button
                      key={c}
                      onClick={() => handleCareerSubmit(c)}
                      disabled={isLoadingSkills}
                      className="px-4 py-2 bg-white border border-gray-200 hover:border-indigo-400 hover:text-indigo-600 rounded-full text-sm font-medium text-gray-700 transition-colors shadow-sm disabled:opacity-50"
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── STEP 2: Rate Skills ── */}
          {step === "skills" && (
            <motion.div
              key="skills"
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -60 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-semibold">
                  <Target className="w-4 h-4" /> {careerGoal}
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Apna Current Level Batao</h2>
                <p className="text-gray-500 text-sm">Slider se honestly apna level set karo (0 = Bilkul nahi pata, 100 = Expert)</p>
              </div>

              <div className="space-y-4">
                {skillsList.map((skill) => {
                  const current = currentLevels[skill.name] ?? 50;
                  const gap = Math.max(0, skill.requiredLevel - current);
                  return (
                    <div key={skill.name} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900">{skill.name}</span>
                            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{skill.category}</span>
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">{skill.description}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-xs text-gray-400">Required</div>
                          <div className="font-bold text-indigo-600">{skill.requiredLevel}%</div>
                        </div>
                      </div>

                      {/* Dual bar */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-500 w-16 shrink-0">Current</span>
                          <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${current}%` }}
                              transition={{ duration: 0.4 }}
                            />
                          </div>
                          <span className="text-xs font-bold text-indigo-600 w-8 shrink-0">{current}%</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-500 w-16 shrink-0">Required</span>
                          <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full opacity-60"
                              style={{ width: `${skill.requiredLevel}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-amber-600 w-8 shrink-0">{skill.requiredLevel}%</span>
                        </div>
                      </div>

                      <input
                        type="range"
                        min={0}
                        max={100}
                        step={5}
                        value={current}
                        onChange={(e) =>
                          setCurrentLevels((prev) => ({ ...prev, [skill.name]: Number(e.target.value) }))
                        }
                        className="w-full accent-indigo-600 cursor-pointer"
                      />

                      {gap > 0 ? (
                        <div className="flex items-center gap-1.5 text-xs text-red-500">
                          <AlertCircle className="w-3.5 h-3.5" />
                          {gap} point ka gap hai — sikhna padega
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-xs text-green-600">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Required level achieve kar liya!
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {error && <p className="text-red-500 text-sm text-center">{error}</p>}

              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-2xl transition-all shadow-lg disabled:opacity-60 flex items-center justify-center gap-3 text-base"
              >
                {isAnalyzing ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    AI Analysis Ho Rahi Hai...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    Learning Roadmap Generate Karo
                  </>
                )}
              </button>
            </motion.div>
          )}

          {/* ── STEP 3: Results ── */}
          {step === "results" && analysis && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Overall Readiness Card */}
              <div className={`bg-gradient-to-br ${readinessBg(analysis.overallReadiness)} rounded-3xl p-6 text-white shadow-xl`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm font-medium">Career Goal</p>
                    <h2 className="text-2xl font-extrabold mt-1">{analysis.careerGoal}</h2>
                    <div className="flex items-center gap-2 mt-3">
                      <Clock className="w-4 h-4 text-white/80" />
                      <span className="text-sm text-white/90">Estimated: <strong>{analysis.estimatedTime}</strong></span>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-5xl font-black">{analysis.overallReadiness}%</div>
                    <div className="text-sm text-white/80 mt-1">Readiness</div>
                  </div>
                </div>
                <div className="mt-4 h-2 bg-white/20 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-white rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${analysis.overallReadiness}%` }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                  />
                </div>
              </div>

              {/* Skill Gap Breakdown */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-bold text-gray-900 text-lg">Skill Gap Breakdown</h3>
                </div>
                <div className="space-y-3">
                  {(analysis.skills ?? []).map((skill) => (
                    <div key={skill.name} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-800 text-sm">{skill.name}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${PRIORITY_COLOR[skill.priority] ?? "text-gray-600 bg-gray-50 border-gray-200"}`}>
                            {skill.priority} Priority
                          </span>
                        </div>
                        <span className="text-xs text-gray-400">{skill.currentLevel} → {skill.requiredLevel}</span>
                      </div>
                      <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="absolute h-full bg-amber-200 rounded-full"
                          style={{ width: `${skill.requiredLevel}%` }}
                        />
                        <motion.div
                          className="absolute h-full bg-indigo-500 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${skill.currentLevel}%` }}
                          transition={{ duration: 0.6 }}
                        />
                      </div>
                      {skill.resources?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {skill.resources.map((r, i) => (
                            <span key={i} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">
                              {r}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Learning Roadmap */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-bold text-gray-900 text-lg">Learning Roadmap</h3>
                </div>
                {(analysis.roadmap ?? []).map((phase, i) => (
                  <motion.div
                    key={phase.phase}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                  >
                    <button
                      onClick={() => setExpandedPhase(expandedPhase === i ? null : i)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-sm flex items-center justify-center shrink-0">
                          {phase.phase}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">{phase.title}</div>
                          <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" /> {phase.duration}
                          </div>
                        </div>
                      </div>
                      <ChevronRight
                        className={`w-4 h-4 text-gray-400 transition-transform ${expandedPhase === i ? "rotate-90" : ""}`}
                      />
                    </button>

                    <AnimatePresence>
                      {expandedPhase === i && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
                            {phase.skills?.length > 0 && (
                              <div className="flex flex-wrap gap-1.5">
                                {phase.skills.map((s, j) => (
                                  <span key={j} className="text-xs bg-purple-50 text-purple-700 px-2.5 py-1 rounded-full font-medium">
                                    {s}
                                  </span>
                                ))}
                              </div>
                            )}
                            <ul className="space-y-2">
                              {(phase.actions ?? []).map((action, j) => (
                                <li key={j} className="flex items-start gap-2.5 text-sm text-gray-700">
                                  <CheckCircle2 className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
                                  {action}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => { setStep("goal"); setAnalysis(null); setSkillsList([]); setCareerInput(""); }}
                  className="flex-1 py-3 border-2 border-indigo-200 text-indigo-600 font-semibold rounded-xl hover:bg-indigo-50 transition-colors text-sm"
                >
                  Naya Goal Try Karo
                </button>
                <button
                  onClick={() => setLocation("/")}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors text-sm"
                >
                  Career Quiz Bhi Lo
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
