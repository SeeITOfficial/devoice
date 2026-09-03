import { getServerConfig } from "@/lib/config";

export function validateMediaUrl(url: string | null | undefined, type: "image" | "media" | "any" = "any"): string | null {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith("/")) {
    return type === "image" ? null : trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return null;
    
    if (type === "image") {
      const r2PublicUrl = getServerConfig().r2PublicUrl;
      if (!r2PublicUrl) return null;
      
      let r2Url: URL;
      try {
        r2Url = new URL(r2PublicUrl);
      } catch {
        return null; // Fail-closed if R2 URL is malformed
      }

      // next.config.ts only allows R2 domain for next/image
      if (parsed.hostname !== r2Url.hostname) {
         return null;
      }
    }
    
    return trimmed;
  } catch {
    return null;
  }
}
