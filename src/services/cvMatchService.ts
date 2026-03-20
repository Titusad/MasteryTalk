import { projectId, publicAnonKey } from "../../utils/supabase/info";

export interface CVMatchInsight {
  finding: string;
  actionableAdvice: string;
}

export interface CVMatchResult {
  qualitativeInsights: CVMatchInsight[];
}

export const analyzeCvMatch = async (cv: string, jobDescription: string): Promise<CVMatchResult> => {
  if (!projectId || !publicAnonKey) {
    throw new Error("Supabase credentials missing");
  }

  const serverUrl = `https://${projectId}.supabase.co/functions/v1/make-server-08b8658d/analyze-cv-match`;
  const res = await fetch(serverUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${publicAnonKey}`,
    },
    body: JSON.stringify({ cv, jobDescription }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Analyze CV failed: ${res.status} ${errText}`);
  }

  return res.json();
};
