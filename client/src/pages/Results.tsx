import React, { useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { motion, Variants } from "framer-motion";
import confetti from "canvas-confetti";
import {
  TrendingUp,
  DollarSign,
  Star,
  Briefcase,
  Map,
  CheckCircle,
  RotateCcw,
  Award,
  Lightbulb,
  Link as LinkIcon,
  Shield,
  MapPin,
  BrainCircuit,
  Home,
  Download,
  Target,
} from "lucide-react";
import { useQuiz } from "@/context/QuizContext";
import CareerChatbot from "@/components/CareerChatbot";

/* ── SVG Circular Progress ── */
function CircularScore({ score }: { score: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const dashoffset = circumference - (score / 100) * circumference;
  const color = score >= 85 ? "#10b981" : score >= 70 ? "#3b82f6" : "#f59e0b";

  return (
    <div className="relative w-36 h-36 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle
          cx="60"
          cy="60"
          r={radius}
          stroke="#e5e7eb"
          strokeWidth="10"
          fill="none"
        />
        <circle
          cx="60"
          cy="60"
          r={radius}
          stroke={color}
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashoffset}
          style={{ transition: "stroke-dashoffset 1.5s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-black text-gray-900">{score}%</span>
        <span className="text-xs font-semibold text-gray-400">Match</span>
      </div>
    </div>
  );
}

/* ── Skill Bar ── */
function SkillBar({ skill, index }: { skill: string; index: number }) {
  const widths = [92, 85, 78, 72, 88, 80, 75];
  const width = widths[index % widths.length];
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">{skill}</span>
        <span className="text-xs text-gray-400 font-semibold">{width}%</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-blue-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${width}%` }}
          transition={{
            delay: index * 0.1 + 0.5,
            duration: 0.8,
            ease: "easeOut",
          }}
        />
      </div>
    </div>
  );
}

export default function Results() {
  const [, setLocation] = useLocation();
  const { result, reset } = useQuiz();
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!result) {
      setLocation("/");
      return;
    }

    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
    const randomInRange = (min: number, max: number) =>
      Math.random() * (max - min) + min;

    const interval: ReturnType<typeof setInterval> = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);
      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ["#3b82f6", "#8b5cf6", "#f59e0b"],
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ["#3b82f6", "#8b5cf6", "#f59e0b"],
      });
    }, 250);

    return () => clearInterval(interval);
  }, [result, setLocation]);

  const handlePrint = () => window.print();
  const handleRetake = () => {
    reset();
    setLocation("/quiz");
  };

  if (!result) return null;

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  return (
    <>
      {/* Print Styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .print-card { box-shadow: none !important; border: 1px solid #e5e7eb !important; }
          .page-break { page-break-before: always; }
        }
      `}</style>

      <div
        className="bg-[#EEF4FF] min-h-[calc(100vh-4rem)] pb-20"
        ref={printRef}
      >
        {/* ── Hero Banner ── */}
        <div className="bg-[#ffffff] text-black px-4 py-12 text-center overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-white rounded-full"
                style={{
                  left: `${(i * 5.3) % 100}%`,
                  top: `${(i * 7.7) % 100}%`,
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </div>
          <div className="relative z-10 max-w-3xl mx-auto">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", bounce: 0.5 }}
              className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-bold mb-5 border border-white/30"
            >
              <Star className="w-4 h-4 fill-amber-300 text-amber-300" />
              {result.matchScore}% Career Match
            </motion.div>
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-black mb-4"
            >
              {result.careerTitle}
            </motion.h1>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-black-500 max-w-2xl mx-auto"
            >
              {result.description}
            </motion.p>
          </div>
        </div>

        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-10">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-6"
          >
            {/* ── Top Metrics Row ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Match Score — circular */}
              <motion.div
                variants={itemVariants}
                className="bg-white print-card rounded-2xl p-6 shadow-sm border border-blue-100 flex flex-col items-center text-center"
              >
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                  Match Score
                </p>
                <CircularScore score={result.matchScore} />
                <div className="mt-4 p-3 bg-blue-50 rounded-xl border border-blue-100">
                  <p className="text-[11px] text-blue-700 leading-relaxed italic">
                    "{result.matchScoreBreakdown}"
                  </p>
                </div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="bg-white print-card rounded-2xl p-6 shadow-sm border border-blue-100 flex flex-col justify-between"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 bg-green-100 rounded-xl">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Salary Range
                  </p>
                </div>
                <p className="text-xl font-extrabold text-gray-900 leading-tight">
                  {result.salaryRange}
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Annual salary in India
                </p>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="bg-white print-card rounded-2xl p-6 shadow-sm border border-blue-100 flex flex-col justify-between"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 bg-blue-100 rounded-xl">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Job Outlook
                  </p>
                </div>
                <p className="text-base font-bold text-gray-900 leading-snug">
                  {result.jobOutlook}
                </p>
              </motion.div>
            </div>

            {/* ── Future-Proof / AI Risk / Top Cities ── */}
            {((result as any).futureProofScore !== undefined ||
              (result as any).aiReplacementRisk ||
              (result as any).topCities) && (
                <motion.div
                  variants={itemVariants}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4"
                >
                  {(result as any).futureProofScore !== undefined && (
                    <div className="bg-white print-card rounded-2xl p-6 shadow-sm border border-purple-100">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2.5 bg-purple-100 rounded-xl">
                          <Shield className="w-5 h-5 text-purple-600" />
                        </div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                          Future-Proof Score
                        </p>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black text-purple-600">
                          {(result as any).futureProofScore}
                        </span>
                        <span className="text-sm font-semibold text-gray-400">
                          / 100
                        </span>
                      </div>
                      <div className="mt-3 h-2 bg-purple-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                          style={{
                            width: `${(result as any).futureProofScore}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {(result as any).aiReplacementRisk && (
                    <div className="bg-white print-card rounded-2xl p-6 shadow-sm border border-amber-100">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2.5 bg-amber-100 rounded-xl">
                          <BrainCircuit className="w-5 h-5 text-amber-600" />
                        </div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                          AI Replacement Risk
                        </p>
                      </div>
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-sm font-bold ${(result as any).aiReplacementRisk === "Low"
                            ? "bg-emerald-100 text-emerald-700"
                            : (result as any).aiReplacementRisk === "High"
                              ? "bg-red-100 text-red-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                      >
                        {(result as any).aiReplacementRisk} Risk
                      </span>
                      {(result as any).aiRiskExplanation && (
                        <p className="text-xs text-gray-500 mt-3 leading-relaxed">
                          {(result as any).aiRiskExplanation}
                        </p>
                      )}
                    </div>
                  )}

                  {Array.isArray((result as any).topCities) &&
                    (result as any).topCities.length > 0 && (
                      <div className="bg-white print-card rounded-2xl p-6 shadow-sm border border-rose-100">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2.5 bg-rose-100 rounded-xl">
                            <MapPin className="w-5 h-5 text-rose-600" />
                          </div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                            Top Cities for Jobs
                          </p>
                        </div>
                        <ul className="space-y-1.5">
                          {(result as any).topCities.map(
                            (c: string, i: number) => (
                              <li
                                key={i}
                                className="text-sm font-medium text-gray-700 flex items-center gap-2"
                              >
                                <span className="w-1.5 h-1.5 bg-rose-500 rounded-full" />{" "}
                                {c}
                              </li>
                            ),
                          )}
                        </ul>
                      </div>
                    )}
                </motion.div>
              )}

            {/* ── Why Good Fit ── */}
            <motion.div
              variants={itemVariants}
              className="bg-gradient-to-r from-blue-50 to-indigo-50 print-card rounded-2xl p-6 border border-blue-200 shadow-sm"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-600 rounded-xl shrink-0">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 mb-2">
                    Why This Career Suits You
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {result.whyGoodFit}
                  </p>
                </div>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column */}
              <div className="space-y-5">
                {/* Key Skills with bars */}
                <motion.div
                  variants={itemVariants}
                  className="bg-white print-card rounded-2xl p-6 shadow-sm border border-blue-100"
                >
                  <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-5">
                    <Lightbulb className="w-4 h-4 text-amber-500" /> Key Skills
                    Required
                  </h3>
                  <div className="space-y-3">
                    {(result.keySkills ?? []).map((skill, i) => (
                      <SkillBar key={i} skill={skill} index={i} />
                    ))}
                  </div>
                </motion.div>

                {/* Alternative Careers */}
                <motion.div
                  variants={itemVariants}
                  className="bg-white print-card rounded-2xl p-6 shadow-sm border border-blue-100"
                >
                  <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-4">
                    <Briefcase className="w-4 h-4 text-blue-600" /> Alternative
                    Careers
                  </h3>
                  <ul className="space-y-2">
                    {(result.alternativeCareers ?? []).map((career, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors cursor-default"
                      >
                        <Target className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        {career}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </div>

              {/* Roadmap */}
              <div className="lg:col-span-2">
                <motion.div
                  variants={itemVariants}
                  className="bg-white print-card rounded-2xl p-6 shadow-sm border border-blue-100"
                >
                  <h3 className="text-xl font-bold flex items-center gap-3 mb-8">
                    <Map className="w-5 h-5 text-blue-600" /> Your Career
                    Roadmap
                  </h3>

                  <div className="relative border-l-2 border-blue-100 ml-4 space-y-8 pb-4">
                    {(result.roadmap ?? []).map((step, index) => (
                      <div key={index} className="relative pl-8 group">
                        <div className="absolute w-8 h-8 bg-blue-600 rounded-full -left-[17px] top-0 border-4 border-white shadow-sm flex items-center justify-center text-white text-xs font-bold group-hover:scale-110 transition-transform">
                          {index + 1}
                        </div>
                        <div className="bg-gray-50 border border-gray-100 p-5 rounded-2xl hover:border-blue-200 hover:bg-blue-50/40 transition-all">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
                              {step.phase}
                            </span>
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                              {step.duration}
                            </span>
                          </div>
                          <h4 className="text-base font-bold text-gray-900 mb-1">
                            {step.title}
                          </h4>
                          <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                            {step.description}
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h5 className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1.5">
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />{" "}
                                Focus Areas
                              </h5>
                              <ul className="space-y-1.5">
                                {(step.skills ?? []).map((skill, sIdx) => (
                                  <li
                                    key={sIdx}
                                    className="text-xs text-gray-600 flex items-start gap-2"
                                  >
                                    <span className="text-blue-400 mt-0.5 font-bold">
                                      •
                                    </span>{" "}
                                    {skill}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            {step.resources && step.resources.length > 0 && (
                              <div>
                                <h5 className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1.5">
                                  <LinkIcon className="w-3.5 h-3.5 text-blue-500" />{" "}
                                  Resources
                                </h5>
                                <ul className="space-y-1.5">
                                  {step.resources.map((resource, rIdx) => (
                                    <li
                                      key={rIdx}
                                      className="text-xs text-blue-600 flex items-start gap-2 hover:underline cursor-pointer"
                                    >
                                      <span className="text-gray-400 mt-0.5">
                                        →
                                      </span>{" "}
                                      {resource}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>

            {/* ── Action Buttons ── */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 no-print"
            >
              <button
                onClick={() => setLocation("/dashboard")}
                className="flex items-center gap-2 px-7 py-3.5 bg-white text-gray-700 font-bold rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:text-blue-600 hover:-translate-y-0.5 transition-all"
              >
                <Home className="w-4 h-4" /> Back to Dashboard
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-7 py-3.5 bg-white text-gray-700 font-bold rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:text-blue-600 hover:-translate-y-0.5 transition-all"
              >
                <Download className="w-4 h-4" /> Download Report
              </button>
              <button
                onClick={handleRetake}
                className="flex items-center gap-2 px-7 py-3.5 bg-white text-gray-700 font-bold rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:text-blue-600 hover:-translate-y-0.5 transition-all"
              >
                <RotateCcw className="w-4 h-4 group-hover:-rotate-180 transition-transform duration-500" />{" "}
                Retake Assessment
              </button>
            </motion.div>
          </motion.div>
        </main>
        <CareerChatbot recommendation={result} />
      </div>
    </>
  );
}
