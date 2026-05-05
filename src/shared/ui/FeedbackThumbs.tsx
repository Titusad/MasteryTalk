import { useState, useEffect } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { SUPABASE_URL, getAuthToken } from "@/services/supabase";

const BASE = `${SUPABASE_URL}/functions/v1/make-server-08b8658d`;

export type FeedbackContentType =
  | "session_brief"
  | "strategy"
  | "interlocutor_intro"
  | "lesson";

interface FeedbackThumbsProps {
  contentType: FeedbackContentType;
  contentId: string;
  sessionId?: string | null;
}

export function FeedbackThumbs({ contentType, contentId, sessionId }: FeedbackThumbsProps) {
  const [token, setToken] = useState<string | null>(null);
  const [vote, setVote] = useState<"up" | "down" | null>(null);
  const [showComment, setShowComment] = useState(false);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getAuthToken().then(setToken).catch(() => null);
  }, []);

  async function submit(v: "up" | "down", c?: string) {
    if (!token) return;
    setLoading(true);
    try {
      await fetch(`${BASE}/content-feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          contentType,
          contentId,
          sessionId: sessionId ?? null,
          vote: v,
          comment: c ?? null,
        }),
      });
      setSubmitted(true);
    } catch (err) {
      console.error("[FeedbackThumbs] Failed to submit:", err);
    } finally {
      setLoading(false);
    }
  }

  function handleVote(v: "up" | "down") {
    setVote(v);
    if (v === "up") {
      submit("up");
    } else {
      setShowComment(true);
    }
  }

  function handleCommentSubmit() {
    submit("down", comment);
    setShowComment(false);
  }

  if (!token) return null;

  if (submitted) {
    return (
      <span className="text-[10px] text-[#94a3b8]">
        {vote === "up" ? "Thanks." : "Got it."}
      </span>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-1">
        <button
          onClick={() => handleVote("up")}
          disabled={loading || vote !== null}
          aria-label="Helpful"
          className={`p-1 rounded transition-colors ${
            vote === "up" ? "text-[#22c55e]" : "text-[#cbd5e1] hover:text-[#64748b]"
          }`}
        >
          <ThumbsUp className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => handleVote("down")}
          disabled={loading || vote !== null}
          aria-label="Not helpful"
          className={`p-1 rounded transition-colors ${
            vote === "down" ? "text-[#ef4444]" : "text-[#cbd5e1] hover:text-[#64748b]"
          }`}
        >
          <ThumbsDown className="w-3.5 h-3.5" />
        </button>
      </div>

      {showComment && (
        <div className="flex flex-col items-end gap-1 mt-0.5">
          <input
            autoFocus
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCommentSubmit()}
            placeholder="What was off? (optional)"
            className="text-[11px] px-2 py-1 rounded-lg border border-[#e2e8f0] bg-white text-[#0f172b] placeholder-[#94a3b8] outline-none focus:border-[#6366f1] w-44"
          />
          <button
            onClick={handleCommentSubmit}
            className="text-[10px] text-[#6366f1] hover:underline"
          >
            Send
          </button>
        </div>
      )}
    </div>
  );
}
