import process from "node:process";
import { type Request, type Response } from "express";
import * as oidc from "openid-client";

export const SESSION_COOKIE = "sid";
export const SESSION_TTL = 30 * 24 * 60 * 60 * 1000; // 30 days
export const ISSUER_URL = process.env.ISSUER_URL || "https://auth.replit.com";

export interface SessionData {
  user: {
    id: string;
    email: string | null;
    firstName: string | null;
    lastName: string | null;
    profileImageUrl: string | null;
  };
  access_token?: string;
  refresh_token?: string;
  expires_at?: number;
}

// Mock session store (use Redis or DB in production)
const sessions = new Map<string, SessionData>();

export function getSessionId(req: Request): string | undefined {
  return req.cookies?.[SESSION_COOKIE];
}

export async function createSession(data: SessionData): Promise<string> {
  const sid = Math.random().toString(36).substring(2) + Date.now().toString(36);
  sessions.set(sid, data);
  return sid;
}

export async function deleteSession(sid: string): Promise<void> {
  sessions.delete(sid);
}

export async function clearSession(res: Response, sid?: string): Promise<void> {
  if (sid) {
    sessions.delete(sid);
  }
  res.clearCookie(SESSION_COOKIE, { path: "/" });
}

export async function getOidcConfig(): Promise<oidc.Configuration> {
  if (!process.env.REPL_ID) {
    // Return a dummy config for local dev bypass
    return {} as any;
  }
  return await oidc.discovery(
    new URL(ISSUER_URL),
    process.env.REPL_ID,
    process.env.REPLIT_OIDC_CLIENT_SECRET,
  );
}
