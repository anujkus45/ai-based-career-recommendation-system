import React from "react";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: string;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: "" };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error: error.message };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("App error caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 p-6">
          <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center space-y-4">
            <div className="text-5xl">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900">Kuch galat ho gaya</h2>
            <p className="text-gray-500 text-sm">{this.state.error || "Unexpected error aaya hai"}</p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: "" });
                window.location.href = "/";
              }}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors"
            >
              Home pe wapas jao
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
