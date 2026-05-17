import { useAuth } from "@workspace/replit-auth-web";
import { motion } from "framer-motion";
import { BrainCircuit, Sparkles, Shield, TrendingUp, Map, ArrowRight } from "lucide-react";

const features = [
  {
    icon: <Sparkles className="w-5 h-5 text-blue-600" />,
    title: "Personalized Assessment",
    desc: "8 smart questions tailored for Indian students.",
  },
  {
    icon: <BrainCircuit className="w-5 h-5 text-purple-600" />,
    title: "AI-Powered Analysis",
    desc: "GPT-4o matches you with the most suitable careers.",
  },
  {
    icon: <Map className="w-5 h-5 text-emerald-600" />,
    title: "Detailed Roadmap",
    desc: "Step-by-step plan with exams, colleges, and resources.",
  },
  {
    icon: <TrendingUp className="w-5 h-5 text-amber-600" />,
    title: "Salary & Job Insights",
    desc: "Real Indian salary data and market outlook.",
  },
];

export default function LoginPage() {
  const { login } = useAuth();

  return (
    <div className="min-h-screen bg-[#EEF4FF] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl shadow-blue-200/40 grid md:grid-cols-2 overflow-hidden border border-blue-100"
      >
        {/* Left — Gradient Branding */}
        <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-8 sm:p-10 text-white relative overflow-hidden">
          {/* Decorative blobs */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-purple-300/20 rounded-full blur-3xl" />

          <div className="relative">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <BrainCircuit className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-base font-bold leading-tight">
                  AI Career Recommendation System
                </h1>
                <p className="text-blue-100 text-xs font-medium">For Indian Students</p>
              </div>
            </div>

            <h2 className="text-3xl md:text-4xl font-extrabold leading-tight mb-4">
              Discover Your <span className="text-amber-300">Ideal</span> Career Path
            </h2>
            <p className="text-blue-100 text-sm md:text-base mb-8 leading-relaxed">
              AI-powered career guidance built for Indian students — complete roadmaps, real salary insights, and scholarships.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {features.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.08 }}
                  className="flex items-start gap-2.5 bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20"
                >
                  <div className="bg-white rounded-lg p-1.5 shrink-0">{f.icon}</div>
                  <div>
                    <p className="text-xs font-bold text-white">{f.title}</p>
                    <p className="text-[11px] text-blue-100 leading-snug mt-0.5">{f.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Right — Login Card */}
        <div className="p-8 sm:p-10 flex flex-col justify-center">
          <div className="text-center mb-7">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BrainCircuit className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1.5">
              Get Started Free
            </h3>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">
              Sign in to take your personalized career assessment. It takes just 2 minutes.
            </p>
          </div>

          <button
            onClick={login}
            className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 text-base shadow-lg shadow-blue-200 hover:shadow-xl hover:-translate-y-0.5 transition-all focus-ring mb-4"
          >
            Sign In / Create Account <ArrowRight className="w-4 h-4" />
          </button>

          <p className="text-center text-xs text-gray-500 mb-6">
            After signing in, you can take the assessment and access all tools.
          </p>

          <div className="pt-5 border-t border-gray-100">
            <div className="flex items-center justify-center flex-wrap gap-x-5 gap-y-2">
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <BrainCircuit className="w-3.5 h-3.5 text-blue-600" />
                <span className="font-medium">GPT-4o Powered</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Shield className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-medium">Secure Login</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <span>🇮🇳</span>
                <span className="font-medium">India Focused</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
