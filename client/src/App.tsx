import { useEffect } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QuizProvider } from "@/context/QuizContext";
import { useAuth, AuthProvider } from "@workspace/replit-auth-web";

import Quiz from "@/pages/Quiz";
import Dashboard from "@/pages/Dashboard";
import Results from "@/pages/Results";
import SkillGap from "@/pages/SkillGap";
import StreamSelector from "@/pages/StreamSelector";
import CareerCompare from "@/pages/CareerCompare";
import CostScholarship from "@/pages/CostScholarship";
import NotFound from "@/pages/not-found";
import LoginPage from "@/pages/Login";
import ProfilePage from "@/pages/Profile";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileQuickActionBar from "@/components/MobileQuickActionBar";
import OnboardingModal from "@/components/OnboardingModal";

const queryClient = new QueryClient();

function RootRedirect() {
  const [, setLocation] = useLocation();
  useEffect(() => {
    setLocation("/dashboard", { replace: true });
  }, [setLocation]);
  return null;
}

function Router() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pb-16 lg:pb-0">
        <Switch>
          <Route path="/" component={RootRedirect} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/quiz" component={Quiz} />
          <Route path="/results" component={Results} />
          <Route path="/skill-gap" component={SkillGap} />
          <Route path="/stream-selector" component={StreamSelector} />
          <Route path="/compare" component={CareerCompare} />
          <Route path="/cost" component={CostScholarship} />
          <Route path="/profile" component={ProfilePage} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
      <MobileQuickActionBar />
      <OnboardingModal />
    </div>
  );
}

function AuthGate({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#EEF4FF]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-blue-600 font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <QuizProvider>
            <AuthProvider>
              <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
                <AuthGate>
                  <Router />
                </AuthGate>
              </WouterRouter>
            </AuthProvider>
            <Toaster />
          </QuizProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
