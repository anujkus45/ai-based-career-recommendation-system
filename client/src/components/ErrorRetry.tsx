import { AlertCircle, RotateCcw } from "lucide-react";

interface Props {
  message: string;
  onRetry: () => void;
}

export default function ErrorRetry({ message, onRetry }: Props) {
  return (
    <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="flex items-start gap-3 flex-1">
        <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-red-900">Something went wrong</p>
          <p className="text-xs text-red-700 mt-0.5 leading-relaxed">{message}</p>
        </div>
      </div>
      <button
        onClick={onRetry}
        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl focus-ring transition-colors shrink-0"
      >
        <RotateCcw className="w-3.5 h-3.5" /> Try Again
      </button>
    </div>
  );
}
