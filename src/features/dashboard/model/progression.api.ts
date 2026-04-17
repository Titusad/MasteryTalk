import { SUPABASE_URL } from "@/services/supabase";
import { getAuthToken } from "@/services/supabase";
import { projectId } from "@/../utils/supabase/info";
import type { RemedialContent, StructuredLesson } from "@/services/types";

const BASE = `${SUPABASE_URL}/functions/v1/make-server-08b8658d`;

export async function fetchRemedialContent(pathId: string, levelId: string): Promise<RemedialContent> {
  const token = await getAuthToken();
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(
    `${BASE}/progression/remedial?pathId=${pathId}&levelId=${levelId}`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );

  if (!res.ok) {
    if (res.status === 404) {
      throw new Error("No remedial content found for this level.");
    }
    throw new Error("Failed to fetch remedial content.");
  }

  return res.json();
}

export async function fetchLessonContent(pathId: string, levelId: string): Promise<StructuredLesson> {
  const token = await getAuthToken();
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(
    `${BASE}/progression/lesson?pathId=${pathId}&levelId=${levelId}`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );

  if (!res.ok) {
    if (res.status === 404) {
      throw new Error("NO_LESSON");
    }
    throw new Error("Failed to fetch lesson content.");
  }

  return res.json();
}

export async function completeLessonAndUnlock(pathId: string, levelId: string): Promise<void> {
  const token = await getAuthToken();
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(
    `${BASE}/progression/complete-lesson`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ pathId, levelId }),
    }
  );

  if (!res.ok) {
    throw new Error("Failed to complete lesson.");
  }
}
