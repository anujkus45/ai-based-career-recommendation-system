import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, Sparkles, Clock, ListChecks, ChevronLeft } from 'lucide-react';
import { useGetCareerQuestions, useGetCareerRecommendation } from '@workspace/api-client-react';
import { useQuiz } from '@/context/QuizContext';
import AIThinking from '@/components/AIThinking';
import ErrorRetry from '@/components/ErrorRetry';
import Breadcrumb from '@/components/Breadcrumb';

const PROGRESS_KEY = "quiz_progress_v1";

interface SavedProgress {
  stepIndex: number;
  answers: Record<string, string>;
}

export default function Quiz() {
  const [, setLocation] = useLocation();
  const { setAnswers, setResult } = useQuiz();
  const [hasStarted, setHasStarted] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [localAnswers, setLocalAnswers] = useState<Record<string, string>>({});
  const [hasResume, setHasResume] = useState(false);

  const { data: questionsResponse, isLoading: isLoadingQuestions, refetch: refetchQuestions, isError: questionsError } = useGetCareerQuestions();
  const recommendMutation = useGetCareerRecommendation();

  const questions = questionsResponse?.questions || [];

  // Detect saved progress on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(PROGRESS_KEY);
      if (raw) {
        const saved: SavedProgress = JSON.parse(raw);
        if (saved.stepIndex > 0 && Object.keys(saved.answers).length > 0) {
          setHasResume(true);
        }
      }
    } catch { /* ignore */ }
  }, []);

  // Save progress on every answer
  useEffect(() => {
    if (!hasStarted) return;
    if (Object.keys(localAnswers).length === 0) return;
    try {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify({ stepIndex: currentStepIndex, answers: localAnswers }));
    } catch { /* ignore */ }
  }, [currentStepIndex, localAnswers, hasStarted]);

  const clearProgress = () => {
    try { localStorage.removeItem(PROGRESS_KEY); } catch { /* ignore */ }
  };

  const handleStart = (resume = false) => {
    if (resume) {
      try {
        const raw = localStorage.getItem(PROGRESS_KEY);
        if (raw) {
          const saved: SavedProgress = JSON.parse(raw);
          setLocalAnswers(saved.answers);
          setCurrentStepIndex(saved.stepIndex);
        }
      } catch { /* ignore */ }
    } else {
      clearProgress();
      setLocalAnswers({});
      setCurrentStepIndex(0);
    }
    setHasStarted(true);
  };

  const handleSelectOption = async (questionId: string, value: string) => {
    const newAnswers = { ...localAnswers, [questionId]: value };
    setLocalAnswers(newAnswers);

    if (currentStepIndex < questions.length - 1) {
      setTimeout(() => setCurrentStepIndex((prev) => prev + 1), 350);
    } else {
      const formattedAnswers = Object.entries(newAnswers).map(([qId, ans]) => ({
        questionId: qId,
        answer: ans,
      }));
      setAnswers(formattedAnswers);
      try {
        const result = await recommendMutation.mutateAsync({ data: { answers: formattedAnswers } });
        setResult(result);
        clearProgress();
        setLocation('/results');
      } catch (err) {
        console.error("Recommendation failed:", err);
      }
    }
  };

  const handleBackQuestion = () => {
    if (currentStepIndex > 0) setCurrentStepIndex((i) => i - 1);
  };

  /* ── LANDING ── */
  if (!hasStarted) {
    return (
      <div className="bg-[#EEF4FF] min-h-[calc(100vh-4rem)]">
        <Breadcrumb current="Career Assessment" />
        <section className="relative overflow-hidden pt-12 pb-10 px-4 text-center">
          <div className="absolute top-10 left-[8%] w-20 h-20 bg-blue-100 rounded-full opacity-60 blur-sm" />
          <div className="absolute top-4 right-[12%] w-14 h-14 bg-indigo-200 rounded-full opacity-40 blur-sm" />

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative inline-block mb-6"
          >
            <div className="relative w-44 h-44 mx-auto">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-200 to-indigo-200 rounded-full opacity-60" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center gap-0.5">
                    <div className="w-24 h-4 bg-indigo-500 rounded-sm shadow-md" />
                    <div className="w-28 h-4 bg-blue-400 rounded-sm shadow-md" />
                    <div className="w-32 h-4 bg-blue-600 rounded-sm shadow-md" />
                  </div>
                  <div className="relative z-10 text-6xl mb-2 drop-shadow-lg">🧑‍💻</div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-3"
          >
            Find Your <span className="text-blue-600">Ideal</span> Career
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="text-gray-600 text-base md:text-lg max-w-xl mx-auto mb-6"
          >
            Answer 8 quick questions and our AI will recommend the best career paths for you.
          </motion.p>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-blue-100 rounded-full text-xs font-semibold text-blue-700">
              <ListChecks className="w-3.5 h-3.5" /> 8 Questions
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-blue-100 rounded-full text-xs font-semibold text-blue-700">
              <Clock className="w-3.5 h-3.5" /> ~2 minutes
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-blue-100 rounded-full text-xs font-semibold text-blue-700">
              <BrainCircuit className="w-3.5 h-3.5" /> GPT-4o powered
            </span>
          </div>

          {questionsError && (
            <div className="max-w-md mx-auto mb-6">
              <ErrorRetry message="Could not load quiz questions." onRetry={() => refetchQuestions()} />
            </div>
          )}

          <div className="flex flex-col items-center gap-3">
            {hasResume && (
              <button
                onClick={() => handleStart(true)}
                className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm px-6 py-2.5 rounded-xl shadow-md focus-ring transition-all"
              >
                Resume where you left off
              </button>
            )}
            <button
              onClick={() => handleStart(false)}
              disabled={isLoadingQuestions || questionsError}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-base px-10 py-3.5 rounded-xl shadow-lg shadow-blue-200 hover:shadow-xl transition-all hover:-translate-y-0.5 focus-ring"
            >
              <Sparkles className="w-5 h-5" />
              {hasResume ? "Start New Assessment" : "Start the Quiz"}
            </button>
            <p className="text-xs text-gray-500 mt-1">No payment · Auto-saved · Skip anytime</p>
          </div>
        </section>
      </div>
    );
  }

  /* ── LOADING QUESTIONS ── */
  if (isLoadingQuestions) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-[#EEF4FF] p-4">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-base font-medium text-gray-600 animate-pulse">Loading questions...</p>
        </div>
      </div>
    );
  }

  /* ── AI ANALYZING ── */
  if (recommendMutation.isPending) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-[#EEF4FF] p-4">
        <AIThinking
          steps={[
            "Reading your answers...",
            "Matching your profile to careers...",
            "Calculating future-proof score...",
            "Generating your roadmap...",
          ]}
        />
      </div>
    );
  }

  /* ── AI ERROR ── */
  if (recommendMutation.isError) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-[#EEF4FF] p-4">
        <div className="max-w-md w-full">
          <ErrorRetry
            message="Could not get your recommendation. Please check your connection and try again."
            onRetry={() => recommendMutation.reset()}
          />
        </div>
      </div>
    );
  }

  /* ── QUIZ SCREEN ── */
  const currentQuestion = questions[currentStepIndex];
  const progress = ((currentStepIndex + 1) / questions.length) * 100;

  return (
    <div className="flex flex-col bg-[#EEF4FF] p-4 md:p-8 min-h-[calc(100vh-4rem)]">
      <header className="max-w-3xl w-full mx-auto mb-8 mt-4">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={handleBackQuestion}
            disabled={currentStepIndex === 0}
            className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700 disabled:opacity-30 disabled:cursor-not-allowed focus-ring rounded-md px-1"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          <span className="text-sm font-bold text-blue-600 tracking-wider uppercase">
            {currentStepIndex + 1} / {questions.length}
          </span>
          <span className="text-sm font-medium text-gray-500">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="h-2.5 w-full bg-blue-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-blue-600 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center">
        <div className="max-w-3xl w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStepIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <h2 className="text-2xl md:text-4xl font-bold text-gray-900 leading-tight">
                {currentQuestion?.question}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                {currentQuestion?.options.map((option) => {
                  const isSelected = localAnswers[currentQuestion.id] === option.value;
                  return (
                    <button
                      key={option.value}
                      onClick={() => handleSelectOption(currentQuestion.id, option.value)}
                      className={`text-left p-5 rounded-2xl border-2 transition-all duration-200 ease-out group focus-ring ${isSelected
                          ? 'border-blue-600 bg-blue-50 shadow-md shadow-blue-100'
                          : 'border-blue-100 bg-white shadow-sm hover:border-blue-400 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.99]'
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-base font-medium transition-colors ${isSelected ? 'text-blue-700' : 'text-gray-700 group-hover:text-blue-600'}`}>
                          {option.label}
                        </span>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 ${isSelected ? 'border-blue-600 bg-blue-600' : 'border-gray-300 group-hover:border-blue-400'
                          }`}>
                          {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
