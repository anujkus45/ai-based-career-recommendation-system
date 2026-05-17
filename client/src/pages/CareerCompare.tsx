import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Swords,
  Sparkles,
  AlertCircle,
  Crown,
  Users,
  TrendingUp,
  DollarSign,
  Clock,
  Shield,
  BrainCircuit,
  Share2,
} from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";
import EmptyState from "@/components/EmptyState";
import ErrorRetry from "@/components/ErrorRetry";
import AIThinking from "@/components/AIThinking";
import { shareOrCopy } from "@/lib/share";

const KNOWN_CAREERS = [
  "software engineer",
  "developer",
  "programmer",
  "doctor",
  "mbbs",
  "ca",
  "chartered accountant",
  "mba",
  "ux designer",
  "ui designer",
  "product designer",
  "data scientist",
  "data analyst",
  "lawyer",
  "advocate",
  "pilot",
  "teacher",
  "professor",
  "civil engineer",
  "mechanical engineer",
  "electrical engineer",
  "architect",
  "game developer",
  "product manager",
  "marketing",
  "journalist",
  "nurse",
  "dentist",
  "pharmacist",
  "scientist",
  "researcher",
  "entrepreneur",
  "actor",
  "artist",
  "musician",
  "chef",
  "economist",
  "psychologist",
  "accountant",
  "banker",
  "investment banker",
  "consultant",
  "analyst",
  "designer",
  "writer",
  "editor",
  "photographer",
  "filmmaker",
  "animator",
  "veterinarian",
  "biologist",
  "chemist",
  "physicist",
  "mathematician",
  "statistician",
  "ai engineer",
  "ml engineer",
  "cybersecurity",
  "devops",
  "cloud engineer",
  "blockchain",
  "ias",
  "ips",
  "civil services",
];

function looksLikeCareer(s: string): boolean {
  const v = s.trim().toLowerCase();
  if (v.length < 3) return false;
  if (!/^[a-z][a-z\s\-/().,&]+$/i.test(s.trim())) return false;
  // Either matches a known career fragment OR contains common job keywords
  if (KNOWN_CAREERS.some((c) => v.includes(c) || c.includes(v))) return true;
  return /(engineer|designer|developer|analyst|manager|consultant|doctor|teacher|scientist|officer|specialist|technician|nurse|accountant|architect|artist|writer|founder|lawyer|chef|pilot|journalist|researcher)/.test(
    v,
  );
}

interface CareerInfo {
  name: string;
  tagline: string;
  salaryEntry: string;
  salarySenior: string;
  yearsToJob: number;
  difficultyScore: number;
  stressLevel: number;
  workLifeBalance: number;
  jobSecurity: number;
  futureProofScore: number;
  aiReplacementRisk: string;
  topSkills: string[];
  pros: string[];
  cons: string[];
  examPath: string;
  topColleges: string[];
}

interface CompareResult {
  careerA: CareerInfo;
  careerB: CareerInfo;
  verdict: {
    winner: string;
    summary: string;
    chooseAIf: string;
    chooseBIf: string;
  };
}

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

const SUGGESTIONS = [
  ["Software Engineer", "Doctor"],
  ["Data Scientist", "CA"],
  ["UX Designer", "Product Manager"],
  ["Lawyer", "MBA"],
  ["Game Developer", "Civil Engineer"],
];

function ScoreBar({
  label,
  value,
  max = 10,
  color,
  icon,
}: {
  label: string;
  value: number;
  max?: number;
  color: string;
  icon: React.ReactNode;
}) {
  const pct = (value / max) * 100;
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-600">
          {icon} {label}
        </div>
        <span className="text-xs font-bold text-gray-700">
          {value}/{max}
        </span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

function RiskPill({ risk }: { risk: string }) {
  const map: Record<string, string> = {
    Low: "bg-emerald-100 text-emerald-700 border-emerald-200",
    Medium: "bg-amber-100 text-amber-700 border-amber-200",
    High: "bg-red-100 text-red-700 border-red-200",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${map[risk] ?? map.Medium}`}
    >
      <BrainCircuit className="w-3 h-3" /> AI Risk: {risk}
    </span>
  );
}

function CareerCard({
  data,
  isWinner,
  accent,
}: {
  data: CareerInfo;
  isWinner: boolean;
  accent: "blue" | "purple";
}) {
  const colors =
    accent === "blue"
      ? {
          bar: "bg-blue-500",
          grad: "from-blue-500 to-indigo-600",
          light: "bg-blue-50",
          text: "text-blue-700",
        }
      : {
          bar: "bg-purple-500",
          grad: "from-purple-500 to-pink-600",
          light: "bg-purple-50",
          text: "text-purple-700",
        };

  return (
    <div
      className={`bg-white rounded-2xl shadow-md border-2 ${isWinner ? "border-amber-400 shadow-amber-100" : "border-blue-100"} overflow-hidden relative`}
    >
      {isWinner && (
        <div className="absolute top-3 right-3 z-10 bg-amber-400 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
          <Crown className="w-3 h-3" /> Winner
        </div>
      )}
      <div className={`bg-gradient-to-r ${colors.grad} text-white p-5`}>
        <h3 className="text-xl font-extrabold">{data.name}</h3>
        <p className="text-sm text-white/80 mt-1">{data.tagline}</p>
      </div>

      <div className="p-5 space-y-5">
        {/* Salary + Time */}
        <div className="grid grid-cols-2 gap-3">
          <div className={`${colors.light} rounded-xl p-3`}>
            <DollarSign className={`w-4 h-4 ${colors.text} mb-1`} />
            <p className="text-xs text-gray-500 font-medium">Entry / Senior</p>
            <p className="text-sm font-bold text-gray-900 mt-0.5">
              {data.salaryEntry}
            </p>
            <p className="text-xs text-gray-500">→ {data.salarySenior}</p>
          </div>
          <div className={`${colors.light} rounded-xl p-3`}>
            <Clock className={`w-4 h-4 ${colors.text} mb-1`} />
            <p className="text-xs text-gray-500 font-medium">Years to Job</p>
            <p className="text-2xl font-extrabold text-gray-900">
              {data.yearsToJob}
              <span className="text-sm text-gray-400 ml-1">yrs</span>
            </p>
          </div>
        </div>

        {/* Score Bars */}
        <div className="space-y-3">
          <ScoreBar
            label="Difficulty"
            value={data.difficultyScore}
            color="bg-red-400"
            icon={<TrendingUp className="w-3 h-3" />}
          />
          <ScoreBar
            label="Stress Level"
            value={data.stressLevel}
            color="bg-amber-400"
            icon={<AlertCircle className="w-3 h-3" />}
          />
          <ScoreBar
            label="Work-Life Balance"
            value={data.workLifeBalance}
            color="bg-emerald-400"
            icon={<Users className="w-3 h-3" />}
          />
          <ScoreBar
            label="Job Security"
            value={data.jobSecurity}
            color="bg-blue-500"
            icon={<Shield className="w-3 h-3" />}
          />
          <ScoreBar
            label="Future-Proof"
            value={data.futureProofScore}
            color="bg-purple-500"
            icon={<Sparkles className="w-3 h-3" />}
          />
        </div>

        <RiskPill risk={data.aiReplacementRisk} />

        {/* Skills */}
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            Top Skills
          </p>
          <div className="flex flex-wrap gap-1.5">
            {data.topSkills.map((s, i) => (
              <span
                key={i}
                className={`px-2 py-1 ${colors.light} ${colors.text} text-xs font-semibold rounded-md`}
              >
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* Pros & Cons */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <p className="font-bold text-emerald-600 mb-1.5">✓ Pros</p>
            <ul className="space-y-1 text-gray-600">
              {data.pros.map((p, i) => (
                <li key={i}>• {p}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-bold text-red-500 mb-1.5">✗ Cons</p>
            <ul className="space-y-1 text-gray-600">
              {data.cons.map((c, i) => (
                <li key={i}>• {c}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Path */}
        <div className="pt-3 border-t border-gray-100 space-y-2">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
              Exam Path
            </p>
            <p className="text-sm text-gray-700">{data.examPath}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
              Top Colleges
            </p>
            <p className="text-sm text-gray-700">
              {data.topColleges.join(", ")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

import { authenticatedFetch } from "@/lib/fetch";

export default function CareerCompare() {
  const [careerA, setA] = useState("");
  const [careerB, setB] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CompareResult | null>(null);
  const [error, setError] = useState("");

  // Auto-fill from query params: ?a=...&b=...
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const a = params.get("a");
    const b = params.get("b");
    if (a) setA(a);
    if (b) setB(b);
  }, []);

  const compare = async () => {
    const a = careerA.trim();
    const b = careerB.trim();
    if (a.length < 2 || b.length < 2) {
      setError("Please enter both career names.");
      return;
    }
    if (!looksLikeCareer(a) || !looksLikeCareer(b)) {
      setError(
        "One of the careers doesn't look valid. Try names like 'Software Engineer', 'Doctor', 'CA', 'UX Designer'.",
      );
      return;
    }
    if (a.toLowerCase() === b.toLowerCase()) {
      setError("Please pick two different careers.");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await authenticatedFetch(`${BASE}/api/compare/careers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ careerA: a, careerB: b }),
      });
      if (!res.ok) throw new Error(await res.text());
      setResult(await res.json());
    } catch {
      setError("Comparison failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const tryPair = (a: string, b: string) => {
    setA(a);
    setB(b);
    setError("");
  };

  const handleShare = async () => {
    if (!result) return;
    await shareOrCopy(
      `${result.careerA.name} vs ${result.careerB.name}`,
      `AI Verdict: ${result.verdict.winner} — ${result.verdict.summary}`,
    );
  };

  return (
    <div className="bg-[#ffffff] min-h-[calc(100vh-4rem)] pb-20">
      <Breadcrumb current="Compare Careers" />
      {/* Hero */}
      <div className="bg-[#ffffff] text-black px-4 py-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <div className="inline-flex items-center justify-center w-14 h-14 bg-white/20 rounded-2xl mb-4 backdrop-blur-sm">
            <Swords className="w-7 h-7" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2">
            Career Comparison Tool
          </h1>
          <p className="text-black/100 text-base">
            Compare any two careers head-to-head with AI-powered insights.
          </p>
        </motion.div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-6 space-y-6">
        {/* Input Card */}
        <div className="bg-white rounded-2xl shadow-md border border-black-50 p-6">
          <div className="grid md:grid-cols-[1fr_auto_1fr] gap-3 items-end">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Career 1
              </label>
              <input
                value={careerA}
                onChange={(e) => setA(e.target.value)}
                placeholder="e.g. Software Engineer"
                className="w-full px-4 py-3 border-2 border-blue-100 rounded-xl text-sm font-medium focus:border-blue-500 focus:outline-none transition-colors"
              />
            </div>
            <div className="text-center self-center mt-5">
              <span className="text-2xl font-black text-gray-300">VS</span>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Career 2
              </label>
              <input
                value={careerB}
                onChange={(e) => setB(e.target.value)}
                placeholder="e.g. Doctor"
                className="w-full px-4 py-3 border-2 border-purple-100 rounded-xl text-sm font-medium focus:border-purple-500 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-4">
            <span className="text-xs text-gray-400 font-medium">Try:</span>
            {SUGGESTIONS.map(([a, b], i) => (
              <button
                key={i}
                onClick={() => tryPair(a, b)}
                className="text-xs px-3 py-1.5 bg-gray-50 hover:bg-blue-50 text-gray-600 hover:text-blue-700 border border-gray-200 hover:border-blue-300 rounded-lg font-medium transition-colors"
              >
                {a} vs {b}
              </button>
            ))}
          </div>

          <button
            onClick={compare}
            disabled={loading}
            className="w-full mt-5 py-4 bg-[#ffffff] hover:from-purple-700 hover:to-grey-700 text-black font-bold rounded-xl shadow-lg shadow-grey-200 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" /> Compare Careers
              </>
            )}
          </button>

          {error && (
            <div className="mt-4">
              <ErrorRetry message={error} onRetry={compare} />
            </div>
          )}
        </div>

        {/* Empty state */}
        {!loading && !result && !error && (
          <EmptyState
            icon={Swords}
            title="Pick two careers to compare"
            description="Enter any two careers above and our AI will give you a side-by-side breakdown — salary, difficulty, AI risk, future-proof score, pros & cons, and a final verdict."
            hints={[
              "Salary comparison",
              "AI risk score",
              "Pros & cons",
              "Final verdict",
            ]}
          />
        )}

        {/* AI thinking */}
        {loading && !result && (
          <div className="py-6">
            <AIThinking
              steps={[
                `Looking up ${careerA || "Career A"}...`,
                `Looking up ${careerB || "Career B"}...`,
                "Comparing salaries and difficulty...",
                "Generating final verdict...",
              ]}
            />
          </div>
        )}

        {/* Results */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Verdict */}
            <div className="bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 border-2 border-amber-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center shrink-0">
                    <Crown className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                      AI Verdict
                    </p>
                    <h3 className="text-xl font-extrabold text-gray-900">
                      {result.verdict.winner}
                    </h3>
                  </div>
                </div>
                <button
                  onClick={handleShare}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-white hover:bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg focus-ring transition-colors shrink-0"
                >
                  <Share2 className="w-3.5 h-3.5" /> Share
                </button>
              </div>
              <p className="text-gray-700 mb-4">{result.verdict.summary}</p>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="bg-white rounded-xl p-3 border border-amber-100">
                  <p className="text-xs font-bold text-blue-600 mb-1">
                    Pick {result.careerA.name} if:
                  </p>
                  <p className="text-sm text-gray-700">
                    {result.verdict.chooseAIf}
                  </p>
                </div>
                <div className="bg-white rounded-xl p-3 border border-amber-100">
                  <p className="text-xs font-bold text-purple-600 mb-1">
                    Pick {result.careerB.name} if:
                  </p>
                  <p className="text-sm text-gray-700">
                    {result.verdict.chooseBIf}
                  </p>
                </div>
              </div>
            </div>

            {/* Side-by-side Cards */}
            <div className="grid md:grid-cols-2 gap-5">
              <CareerCard
                data={result.careerA}
                isWinner={result.verdict.winner === result.careerA.name}
                accent="blue"
              />
              <CareerCard
                data={result.careerB}
                isWinner={result.verdict.winner === result.careerB.name}
                accent="blue"
              />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
