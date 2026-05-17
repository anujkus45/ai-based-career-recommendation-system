import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { CareerRecommendation, CareerQuizAnswer } from '@workspace/api-client-react';

interface QuizState {
  answers: CareerQuizAnswer[];
  result: CareerRecommendation | null;
  setAnswers: (answers: CareerQuizAnswer[]) => void;
  setResult: (result: CareerRecommendation | null) => void;
  reset: () => void;
}

const QuizContext = createContext<QuizState | undefined>(undefined);

export function QuizProvider({ children }: { children: ReactNode }) {
  const [answers, setAnswers] = useState<CareerQuizAnswer[]>([]);
  const [result, setResult] = useState<CareerRecommendation | null>(null);

  const reset = () => {
    setAnswers([]);
    setResult(null);
  };

  return (
    <QuizContext.Provider value={{ answers, result, setAnswers, setResult, reset }}>
      {children}
    </QuizContext.Provider>
  );
}

export function useQuiz() {
  const context = useContext(QuizContext);
  if (context === undefined) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
}
