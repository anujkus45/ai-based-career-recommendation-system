export async function shareOrCopy(title: string, text: string, url: string = window.location.href): Promise<"shared" | "copied" | "failed"> {
  try {
    if (typeof navigator !== "undefined" && (navigator as any).share) {
      await (navigator as any).share({ title, text, url });
      return "shared";
    }
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      return "copied";
    }
  } catch {
    /* user cancelled or denied */
  }
  return "failed";
}
