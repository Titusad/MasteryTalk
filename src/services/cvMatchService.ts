import { getAuthToken } from "./supabase";
import { projectId } from "../../utils/supabase/info";

export interface TailoredBullet {
  experienceContext: string;
  rewrittenBullet: string;
  matchReason: string;
}

export interface CVMatchResult {
  tailoredBullets: TailoredBullet[];
}

const MAX_RETRIES = 2;
const BASE_DELAY_MS = 1000;

export const analyzeCvMatch = async (cv: string, jobDescription: string): Promise<CVMatchResult> => {
  if (!projectId) {
    throw new Error("Supabase project ID missing");
  }

  const token = await getAuthToken();
  const serverUrl = `https://${projectId}.supabase.co/functions/v1/make-server-08b8658d/analyze-cv-match`;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(serverUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ cv, jobDescription }),
      });

      if (res.status >= 400 && res.status < 500) {
        const errText = await res.text();
        throw new Error(`Analyze CV failed: ${res.status} ${errText.slice(0, 300)}`);
      }

      if (!res.ok) {
        const errText = await res.text();
        lastError = new Error(`Analyze CV failed: ${res.status} ${errText.slice(0, 300)}`);
        if (attempt < MAX_RETRIES) {
          await new Promise((r) => setTimeout(r, BASE_DELAY_MS * 2 ** attempt));
          continue;
        }
        throw lastError;
      }

      return res.json();
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < MAX_RETRIES && !(err instanceof Error && err.message.startsWith("Analyze CV failed: 4"))) {
        await new Promise((r) => setTimeout(r, BASE_DELAY_MS * 2 ** attempt));
        continue;
      }
      throw lastError;
    }
  }

  throw lastError ?? new Error("analyzeCvMatch: unexpected retry exhaustion");
};
