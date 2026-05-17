// Safe fetch with auth token support
import { auth } from "@workspace/replit-auth-web";

export async function authenticatedFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
  
  // Attach token only for /api/ routes
  if (url.includes("/api/")) {
    const user = auth.currentUser;
    if (user) {
      try {
        const token = await user.getIdToken();
        if (token) {
          init = init || {};
          const newHeaders = new Headers(init.headers || {});
          newHeaders.set("Authorization", `Bearer ${token}`);
          init.headers = newHeaders;
        }
      } catch (err) {
        console.warn("Failed to get Firebase token", err);
      }
    }
  }


  
  return fetch(input, init);
}
