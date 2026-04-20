/**
 * useProgressionState — Shared hook for fetching the user's progression tree.
 *
 * Used by both ProgressionTree (Dashboard) and PracticeSideNav (Session page).
 * Fetches from /progression endpoint and merges with defaults to backfill
 * newly added paths.
 */

import { useState, useEffect, useCallback } from "react";
import { SUPABASE_URL } from "@/services/supabase";
import { getAuthToken } from "@/services/supabase";
import { getDefaultProgressionState } from "./progression-paths";
import type { ProgressionState } from "@/services/types";
import { projectId } from "@/../utils/supabase/info";

export function useProgressionState() {
  const [state, setState] = useState<ProgressionState>(getDefaultProgressionState);
  const [loading, setLoading] = useState(true);

  const fetchState = useCallback(async () => {
    try {
      const token = await getAuthToken();
      if (!token) return;

      const res = await fetch(
        `${SUPABASE_URL}/functions/v1/make-server-08b8658d/progression`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (res.ok) {
        const data = await res.json();
        const defaults = getDefaultProgressionState();
        const merged = { ...defaults, ...data };
        for (const key of Object.keys(defaults) as (keyof typeof defaults)[]) {
          if (key === "activeGoal") continue;
          if (!data[key]) {
            (merged as any)[key] = defaults[key];
          }
        }
        setState(merged as ProgressionState);
      }
    } catch (err) {
      console.error("[useProgressionState] Failed to fetch:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchState();
  }, [fetchState]);

  return { state, loading, refetch: fetchState };
}
