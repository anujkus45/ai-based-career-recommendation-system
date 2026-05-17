import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useAuth } from "@workspace/replit-auth-web";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bookmark, Trash2, GraduationCap, Sparkles, Calendar, Activity, Pencil, Check, Award } from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";
import EmptyState from "@/components/EmptyState";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

const CLASS_LABELS: Record<string, string> = { "9-10": "Class 9-10", "11-12": "Class 11-12", ug: "Undergraduate", grad: "Graduated" };
const INTEREST_CHIPS = ["Coding", "Design", "Data & AI", "Medicine", "Business", "Finance", "Law", "Teaching", "Civil Services", "Engineering", "Media", "Sports"];

interface Profile {
  classLevel?: string | null;
  stream?: string | null;
  interests?: string[];
  preferredCareers?: string[];
  hasCompletedOnboarding?: boolean;
}

interface SavedItem {
  id: number;
  kind: string;
  title: string;
  payload?: unknown;
  createdAt: string;
}

interface Activity {
  kind: string;
  title: string;
  score?: number;
  at: string;
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

import { authenticatedFetch } from "@/lib/fetch";

export default function ProfilePage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [classLevel, setClassLevel] = useState("");
  const [interests, setInterests] = useState<string[]>([]);

  const profileQ = useQuery<{ profile: Profile | null }>({
    queryKey: ["profile"],
    queryFn: async () => {
      const r = await authenticatedFetch(`${BASE}/api/profile`, { credentials: "include" });
      if (!r.ok) throw new Error("failed");
      return r.json();
    },
  });

  const savedQ = useQuery<{ items: SavedItem[] }>({
    queryKey: ["saved-items"],
    queryFn: async () => {
      const r = await authenticatedFetch(`${BASE}/api/saved-items`, { credentials: "include" });
      if (!r.ok) throw new Error("failed");
      return r.json();
    },
  });

  const activityQ = useQuery<{ events: Activity[] }>({
    queryKey: ["activity"],
    queryFn: async () => {
      const r = await authenticatedFetch(`${BASE}/api/activity`, { credentials: "include" });
      if (!r.ok) throw new Error("failed");
      return r.json();
    },
  });

  useEffect(() => {
    const p = profileQ.data?.profile;
    if (p) {
      setClassLevel(p.classLevel ?? "");
      setInterests(p.interests ?? []);
    }
  }, [profileQ.data]);

  const save = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const r = await authenticatedFetch(`${BASE}/api/profile`, { method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!r.ok) throw new Error("save failed");
      return r.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile"] });
      setEditing(false);
    },
  });

  const remove = useMutation({
    mutationFn: async (id: number) => {
      const r = await authenticatedFetch(`${BASE}/api/saved-items/${id}`, { method: "DELETE", credentials: "include" });
      if (!r.ok) throw new Error("delete failed");
      return r.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["saved-items"] }),
  });

  const toggleInterest = (i: string) => {
    setInterests((prev) => (prev.includes(i) ? prev.filter((x) => x !== i) : prev.length >= 6 ? prev : [...prev, i]));
  };

  const profile = profileQ.data?.profile;
  const saved = savedQ.data?.items ?? [];
  const events = activityQ.data?.events ?? [];

  return (
    <div className="bg-[#EEF4FF] min-h-[calc(100vh-4rem)]">
      <Breadcrumb current="Profile" />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-sm border border-blue-100 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-2xl font-extrabold flex items-center justify-center shrink-0">
            {(user?.firstName?.[0] ?? user?.email?.[0] ?? "S").toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-extrabold text-gray-900 truncate">{user?.firstName ?? "Student"} {user?.lastName ?? ""}</h1>
            <p className="text-sm text-gray-500 truncate">{user?.email}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {profile?.classLevel && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700">
                  <GraduationCap className="w-3 h-3" /> {CLASS_LABELS[profile.classLevel] ?? profile.classLevel}
                </span>
              )}
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700">
                <Sparkles className="w-3 h-3" /> {events.filter((e) => e.kind === "assessment").length} assessments
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700">
                <Bookmark className="w-3 h-3" /> {saved.length} saved
              </span>
            </div>
          </div>
          {!editing && (
            <button onClick={() => setEditing(true)} className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-50 focus-ring">
              <Pencil className="w-4 h-4" /> Edit
            </button>
          )}
        </motion.div>

        {/* Edit panel */}
        {editing && (
          <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-6 space-y-5">
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-3">Education stage</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {Object.entries(CLASS_LABELS).map(([v, label]) => (
                  <button key={v} onClick={() => setClassLevel(v)} className={`p-3 rounded-xl border-2 text-sm font-semibold focus-ring transition-all ${classLevel === v ? "border-blue-600 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-700 hover:border-blue-300"}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-3">Interests <span className="text-xs font-normal text-gray-500">(up to 6)</span></h3>
              <div className="flex flex-wrap gap-2">
                {INTEREST_CHIPS.map((c) => {
                  const sel = interests.includes(c);
                  return (
                    <button key={c} onClick={() => toggleInterest(c)} className={`px-3 py-1.5 rounded-full text-xs font-semibold border-2 inline-flex items-center gap-1 focus-ring ${sel ? "border-blue-600 bg-blue-600 text-white" : "border-gray-200 text-gray-700 hover:border-blue-300"}`}>
                      {sel && <Check className="w-3 h-3" />} {c}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
              <button onClick={() => setEditing(false)} className="text-sm font-semibold text-gray-500 hover:text-gray-800 px-3 py-2 focus-ring rounded">Cancel</button>
              <button onClick={() => save.mutate({ classLevel: classLevel || undefined, interests })} disabled={save.isPending} className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white text-sm font-bold px-4 py-2 rounded-xl shadow-md focus-ring">
                {save.isPending ? "Saving..." : "Save changes"}
              </button>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Saved Items */}
          <div className="bg-white rounded-2xl shadow-sm border border-blue-100">
            <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
              <h2 className="font-bold text-gray-900 text-base flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-blue-600" /> Saved
              </h2>
              <span className="text-xs text-gray-400">{saved.length} items</span>
            </div>
            <div className="p-2">
              {savedQ.isLoading ? (
                <div className="p-6 text-center text-sm text-gray-400">Loading…</div>
              ) : saved.length === 0 ? (
                <EmptyState
                  icon={Bookmark}
                  title="Nothing saved yet"
                  description="Bookmark careers, colleges or scholarships from any tool to keep them here."
                />
              ) : (
                <ul className="divide-y divide-gray-50">
                  {saved.map((s) => (
                    <li key={s.id} className="flex items-center gap-3 px-3 py-3 hover:bg-gray-50 rounded-lg group">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-1 rounded-md shrink-0">{s.kind}</span>
                      <p className="flex-1 text-sm font-semibold text-gray-800 truncate">{s.title}</p>
                      <span className="text-xs text-gray-400 shrink-0 hidden sm:inline">{fmtDate(s.createdAt)}</span>
                      <button onClick={() => remove.mutate(s.id)} aria-label="Remove" className="p-1.5 text-gray-300 hover:text-red-500 focus-ring rounded">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Activity */}
          <div className="bg-white rounded-2xl shadow-sm border border-blue-100">
            <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
              <h2 className="font-bold text-gray-900 text-base flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-600" /> Activity
              </h2>
              <span className="text-xs text-gray-400">last {events.length}</span>
            </div>
            <div className="p-2">
              {activityQ.isLoading ? (
                <div className="p-6 text-center text-sm text-gray-400">Loading…</div>
              ) : events.length === 0 ? (
                <EmptyState
                  icon={Activity}
                  title="No activity yet"
                  description="Your assessments and saved items will show up here."
                />
              ) : (
                <ul className="space-y-1">
                  {events.map((e, i) => (
                    <li key={i} className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                        {e.kind === "assessment" ? <Award className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">
                          {e.kind === "assessment" ? "Assessed: " : "Saved: "}{e.title}
                        </p>
                        <p className="text-[11px] text-gray-400 flex items-center gap-1.5 mt-0.5">
                          <Calendar className="w-3 h-3" /> {fmtDate(e.at)}
                          {typeof e.score === "number" && <span className="text-emerald-600 font-bold">· {e.score}% match</span>}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
