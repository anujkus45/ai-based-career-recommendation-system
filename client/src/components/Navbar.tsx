import { useState } from "react";
import {
  BrainCircuit,
  LogOut,
  Home,
  Target,
  User,
  GraduationCap,
  Swords,
  Wallet,
  Menu,
  X,
} from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@workspace/replit-auth-web";
import { AnimatePresence, motion } from "framer-motion";

const NAV_ITEMS = [
  {
    path: "/dashboard",
    label: "Dashboard",
    short: "Home",
    icon: Home,
    alias: ["/"],
  },
  {
    path: "/stream-selector",
    label: "Stream",
    short: "Stream",
    icon: GraduationCap,
  },
  { path: "/compare", label: "Compare", short: "Compare", icon: Swords },
  { path: "/cost", label: "Cost & Aid", short: "Cost", icon: Wallet },
  { path: "/skill-gap", label: "Skill Gap", short: "Skills", icon: Target },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const [open, setOpen] = useState(false);

  const isActive = (path: string, alias?: string[]) =>
    location === path || (alias?.includes(location) ?? false);

  const go = (path: string) => {
    setLocation(path);
    setOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#ffffff] shadow-md">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-2 sm:gap-4">
        {/* Logo */}
        <button
          onClick={() => go("/")}
          className="flex items-center gap-2 sm:gap-2.5 hover:opacity-90 transition-opacity min-w-0"
        >
          <div className="w-8 h-8 bg-black/50 rounded-lg flex items-center justify-center shrink-0">
            <BrainCircuit className="w-5 h-5 text-white" />
          </div>
          <span className="text-black font-bold text-sm hidden md:block truncate">
            AI Career Recommendation System
          </span>
          <span className="text-black font-bold text-sm md:hidden truncate">
            AI Career
          </span>
        </button>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path, item.alias);
            return (
              <button
                key={item.path}
                onClick={() => go(item.path)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${active
                    ? "bg-black/20 text-black"
                    : "text-gray-700 hover:bg-black/10 hover:text-black"
                  }`}
              >
                <Icon className="w-4 h-4" /> {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right: User + Mobile Toggle */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {user?.profileImageUrl ? (
            <img
              src={user.profileImageUrl}
              alt="avatar"
              className="w-8 h-8 rounded-full object-cover border-2 border-white/40"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-black/20 flex items-center justify-center text-black text-sm font-bold">
              {user?.firstName?.[0] ?? user?.email?.[0] ?? (
                <User className="w-4 h-4" />
              )}
            </div>
          )}
          <span className="text-gray-700 text-sm font-medium hidden lg:block max-w-[120px] truncate">
            {user?.firstName ?? user?.email ?? "User"}
          </span>
          <button
            onClick={logout}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-black bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden lg:block">Logout</span>
          </button>

          {/* Hamburger - mobile/tablet only */}
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg text-black bg-gray-100 hover:bg-gray-200 border border-gray-300 transition-all"
          >
            {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="lg:hidden bg-white border-t border-gray-200 shadow-lg"
          >
            <nav className="max-w-6xl mx-auto px-3 sm:px-6 py-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path, item.alias);
                return (
                  <button
                    key={item.path}
                    onClick={() => go(item.path)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${active
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" /> {item.label}
                  </button>
                );
              })}
              <button
                onClick={logout}
                className="sm:hidden flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold bg-red-500/90 text-white hover:bg-red-500 col-span-2"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
