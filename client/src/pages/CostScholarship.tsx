import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Wallet,
  Sparkles,
  GraduationCap,
  Building2,
  Award,
  Banknote,
  Lightbulb,
  TrendingUp,
  Clock,
  BookOpen,
  Share2,
} from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";
import EmptyState from "@/components/EmptyState";
import ErrorRetry from "@/components/ErrorRetry";
import AIThinking from "@/components/AIThinking";
import { shareOrCopy } from "@/lib/share";

interface FeeTier {
  tier: string;
  annualFee: string;
  totalFee: string;
  examples: string[];
  notes: string;
}
interface AddCost {
  item: string;
  cost: string;
}
interface Scholarship {
  name: string;
  provider: string;
  eligibility: string;
  amount: string;
  applyAt: string;
}
interface Loan {
  scheme: string;
  maxAmount: string;
  interestRate: string;
  moratorium: string;
  collateral: string;
  notes: string;
}
interface CostResult {
  career: string;
  courseName: string;
  courseDuration: string;
  totalCostEstimate: string;
  feeBreakdown: FeeTier[];
  additionalCosts: AddCost[];
  scholarships: Scholarship[];
  educationLoans: Loan[];
  smartTips: string[];
  roiSummary: string;
}

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

const SUGGESTIONS = [
  "Software Engineer",
  "Doctor (MBBS)",
  "CA",
  "MBA",
  "UX Designer",
  "Data Scientist",
  "Lawyer",
  "Pilot",
];

const TIER_COLORS = [
  {
    bg: "from-emerald-500 to-teal-600",
    light: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
  },
  {
    bg: "from-blue-500 to-indigo-600",
    light: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
  },
  {
    bg: "from-purple-500 to-pink-600",
    light: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200",
  },
];

import { authenticatedFetch } from "@/lib/fetch";

export default function CostScholarship() {
  const [career, setCareer] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CostResult | null>(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"fees" | "scholarships" | "loans">("fees");

  // Auto-fill from query param (?career=...)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const c = params.get("career");
    if (c && c.length >= 2) {
      setCareer(c);
      void fetchEstimate(c);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchEstimate = async (q?: string) => {
    const value = (q ?? career).trim();
    if (value.length < 2) {
      setError("Please enter a career name.");
      return;
    }
    setCareer(value);
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await authenticatedFetch(`${BASE}/api/cost/estimate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ career: value }),
      });
      if (!res.ok) throw new Error(await res.text());
      setResult(await res.json());
    } catch {
      setError("Failed to fetch estimate. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!result) return;
    await shareOrCopy(
      `Cost estimate for ${result.career}`,
      `Total cost: ${result.totalCostEstimate} • ${result.scholarships.length} scholarships available`,
    );
  };

  return (
    <div className="bg-white min-h-[calc(100vh-4rem)] pb-20 text-black">
      <Breadcrumb current="Cost & Scholarships" />
      {/* Hero */}
      <div className="bg-white text-black px-4 py-10 text-center ">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <div className="inline-flex items-center justify-center w-14 h-14 bg-white/20 rounded-2xl mb-4 backdrop-blur-sm">
            <Wallet className="w-7 h-7" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2">
            Course Cost & Scholarships
          </h1>
          <p className="text-gray-600 text-base">
            Real fee structures, government scholarships, and education loan
            options for any career.
          </p>
        </motion.div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-6 space-y-6">
        {/* Input */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 text-black">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            Which career do you want to plan for?
          </label>
          <div className="flex gap-2">
            <input
              value={career}
              onChange={(e) => setCareer(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchEstimate()}
              placeholder="e.g. Software Engineer, MBBS, CA"
              className="flex-1 px-4 py-3 border-2 border-black-50 rounded-xl text-sm font-medium focus:border-emerald-500 focus:outline-none transition-colors"
            />
            <button
              onClick={() => fetchEstimate()}
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 disabled:opacity-60 flex items-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              Estimate
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-4">
            <span className="text-xs text-gray-500 font-medium">Try:</span>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => fetchEstimate(s)}
                className="text-xs px-3 py-1.5 bg-gray-50 hover:bg-emerald-50 text-gray-600 hover:text-emerald-700 border border-gray-200 hover:border-emerald-300 rounded-lg font-medium transition-colors hover:-translate-y-0.5 focus-ring"
              >
                {s}
              </button>
            ))}
          </div>

          {error && (
            <div className="mt-4">
              <ErrorRetry message={error} onRetry={() => fetchEstimate()} />
            </div>
          )}
        </div>

        {/* Empty state */}
        {!loading && !result && !error && (
          <EmptyState
            icon={GraduationCap}
            title="See the full cost picture for any career"
            description="Enter a career above to get tier-wise fees, top scholarships, education loan schemes, and ROI insights — all India-specific."
            hints={[
              "Real fee structure",
              "Government scholarships",
              "SBI / Vidya Lakshmi loans",
              "Smart money tips",
            ]}
          />
        )}

        {/* AI thinking */}
        {loading && !result && (
          <div className="py-6">
            <AIThinking
              steps={[
                "Looking up course fees...",
                "Finding eligible scholarships...",
                "Checking education loan schemes...",
                "Calculating ROI...",
              ]}
            />
          </div>
        )}

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Summary */}
            <div className="bg-white rounded-2xl shadow-md border border-emerald-100 p-6">
              <div className="flex items-start justify-between gap-3 mb-1">
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                  {result.career}
                </p>
                <button
                  onClick={handleShare}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg focus-ring transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5" /> Share
                </button>
              </div>
              <h2 className="text-2xl font-extrabold text-gray-900">
                {result.courseName}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-5">
                <div className="bg-emerald-50 rounded-xl p-4">
                  <Clock className="w-4 h-4 text-emerald-600 mb-1" />
                  <p className="text-xs text-gray-500 font-medium">Duration</p>
                  <p className="text-base font-bold text-gray-900">
                    {result.courseDuration}
                  </p>
                </div>
                <div className="bg-blue-50 rounded-xl p-4">
                  <Wallet className="w-4 h-4 text-blue-600 mb-1" />
                  <p className="text-xs text-gray-500 font-medium">
                    Total Cost Range
                  </p>
                  <p className="text-base font-bold text-gray-900">
                    {result.totalCostEstimate}
                  </p>
                </div>
                <div className="bg-purple-50 rounded-xl p-4 col-span-2 md:col-span-1">
                  <Award className="w-4 h-4 text-purple-600 mb-1" />
                  <p className="text-xs text-gray-500 font-medium">
                    Scholarships Found
                  </p>
                  <p className="text-base font-bold text-gray-900">
                    {result.scholarships.length} options
                  </p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-2xl shadow-md border border-emerald-100 overflow-hidden">
              <div className="flex border-b border-gray-100">
                {(
                  [
                    {
                      id: "fees",
                      label: "Fee Structure",
                      icon: <Building2 className="w-4 h-4" />,
                    },
                    {
                      id: "scholarships",
                      label: "Scholarships",
                      icon: <Award className="w-4 h-4" />,
                    },
                    {
                      id: "loans",
                      label: "Education Loans",
                      icon: <Banknote className="w-4 h-4" />,
                    },
                  ] as const
                ).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold transition-all ${
                      tab === t.id
                        ? "text-emerald-700 border-b-2 border-emerald-600 bg-emerald-50/50"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {t.icon} {t.label}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {tab === "fees" && (
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-3 gap-4">
                      {result.feeBreakdown.map((tier, i) => {
                        const c = TIER_COLORS[i] ?? TIER_COLORS[0];
                        return (
                          <div
                            key={i}
                            className={`rounded-2xl border-2 ${c.border} overflow-hidden`}
                          >
                            <div
                              className={`bg-gradient-to-r ${c.bg} text-white p-4`}
                            >
                              <p className="text-xs uppercase tracking-wider opacity-80">
                                Tier {i + 1}
                              </p>
                              <p className="font-bold text-base leading-tight mt-0.5">
                                {tier.tier}
                              </p>
                            </div>
                            <div className={`${c.light} p-4 space-y-3`}>
                              <div>
                                <p className="text-xs text-gray-500 font-medium">
                                  Annual Fee
                                </p>
                                <p className="text-lg font-extrabold text-gray-900">
                                  {tier.annualFee}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 font-medium">
                                  Total Course Fee
                                </p>
                                <p className="text-base font-bold text-gray-800">
                                  {tier.totalFee}
                                </p>
                              </div>
                              <div className="pt-2 border-t border-white/60">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                                  Examples
                                </p>
                                <ul className="space-y-1">
                                  {tier.examples.map((e, j) => (
                                    <li
                                      key={j}
                                      className={`text-xs ${c.text} font-semibold flex items-center gap-1`}
                                    >
                                      <span className="w-1 h-1 bg-current rounded-full" />{" "}
                                      {e}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <p className="text-xs text-gray-600 italic pt-2 border-t border-white/60">
                                {tier.notes}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                      <h4 className="text-sm font-bold text-amber-900 mb-3 flex items-center gap-2">
                        <BookOpen className="w-4 h-4" /> Additional Costs to
                        Plan For
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {result.additionalCosts.map((a, i) => (
                          <div
                            key={i}
                            className="bg-white rounded-lg p-3 border border-amber-100"
                          >
                            <p className="text-xs text-amber-700 font-bold">
                              {a.item}
                            </p>
                            <p className="text-sm font-bold text-gray-800 mt-1">
                              {a.cost}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {tab === "scholarships" && (
                  <div className="space-y-3">
                    {result.scholarships.map((s, i) => (
                      <div
                        key={i}
                        className="border border-purple-100 rounded-xl p-4 hover:border-purple-300 hover:shadow-md transition-all"
                      >
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shrink-0">
                              <Award className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900 leading-tight">
                                {s.name}
                              </h4>
                              <p className="text-xs text-purple-600 font-semibold mt-0.5">
                                {s.provider}
                              </p>
                            </div>
                          </div>
                          <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold whitespace-nowrap">
                            {s.amount}
                          </span>
                        </div>
                        <div className="grid md:grid-cols-2 gap-3 ml-13 pl-13 text-xs">
                          <div className="bg-gray-50 rounded-lg p-2.5">
                            <p className="font-bold text-gray-500 uppercase tracking-wider mb-1">
                              Eligibility
                            </p>
                            <p className="text-gray-700">{s.eligibility}</p>
                          </div>
                          <div className="bg-blue-50 rounded-lg p-2.5">
                            <p className="font-bold text-blue-600 uppercase tracking-wider mb-1">
                              Apply At
                            </p>
                            <p className="text-gray-700">{s.applyAt}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {tab === "loans" && (
                  <div className="space-y-3">
                    {result.educationLoans.map((l, i) => (
                      <div
                        key={i}
                        className="border border-blue-100 rounded-xl p-4 hover:border-blue-300 hover:shadow-md transition-all"
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                            <Banknote className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900 leading-tight">
                              {l.scheme}
                            </h4>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {l.notes}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                          <div className="bg-blue-50 rounded-lg p-2.5">
                            <p className="font-bold text-blue-600 uppercase tracking-wider text-[10px]">
                              Max Amount
                            </p>
                            <p className="text-gray-800 font-bold mt-1">
                              {l.maxAmount}
                            </p>
                          </div>
                          <div className="bg-emerald-50 rounded-lg p-2.5">
                            <p className="font-bold text-emerald-600 uppercase tracking-wider text-[10px]">
                              Interest Rate
                            </p>
                            <p className="text-gray-800 font-bold mt-1">
                              {l.interestRate}
                            </p>
                          </div>
                          <div className="bg-amber-50 rounded-lg p-2.5">
                            <p className="font-bold text-amber-700 uppercase tracking-wider text-[10px]">
                              Repayment
                            </p>
                            <p className="text-gray-800 font-bold mt-1">
                              {l.moratorium}
                            </p>
                          </div>
                          <div className="bg-purple-50 rounded-lg p-2.5">
                            <p className="font-bold text-purple-600 uppercase tracking-wider text-[10px]">
                              Collateral
                            </p>
                            <p className="text-gray-800 font-bold mt-1">
                              {l.collateral}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Smart Tips + ROI */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl shadow-md border border-emerald-100 p-6">
                <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-500" /> Smart Money
                  Tips
                </h3>
                <ul className="space-y-2.5">
                  {result.smartTips.map((t, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2.5 text-sm text-gray-700"
                    >
                      <span className="w-5 h-5 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 text-black">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-5 h-5 text-black" />
                  <h3 className="text-base font-bold text-black">
                    ROI Analysis
                  </h3>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {result.roiSummary}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
