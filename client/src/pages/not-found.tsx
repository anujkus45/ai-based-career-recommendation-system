import { Link } from "wouter";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <div className="max-w-md w-full p-8 bg-white rounded-2xl shadow-xl border border-border text-center space-y-6">
        <div className="w-16 h-16 bg-destructive/10 rounded-2xl flex items-center justify-center mx-auto text-destructive">
          <AlertCircle className="w-8 h-8" />
        </div>
        
        <h1 className="text-3xl font-bold font-display text-foreground">404 - Page Not Found</h1>
        <p className="text-muted-foreground">
          Oops! The page you are looking for doesn't exist or has been moved.
        </p>
        
        <Link 
          href="/" 
          className="inline-flex items-center justify-center px-6 py-3 bg-primary text-white font-semibold rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 transition-all"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
}
