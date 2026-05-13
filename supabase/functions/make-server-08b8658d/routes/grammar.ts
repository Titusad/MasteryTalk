/**
 * Grammar Examples Route
 *
 * POST /grammar-examples
 * Auth: Bearer token required
 *
 * Generates 3 personalized examples for a grammar structure,
 * contextualized to the user's role, industry, and seniority.
 *
 * Falls back to the staticExamples from the request body if the
 * OpenAI call fails or times out (>5s).
 */

import { Hono } from "npm:hono";
import { getAuthUser, callOpenAIChat, logApiUsage } from "../_shared.ts";

const app = new Hono();

app.post("/make-server-08b8658d/grammar-examples", async (c) => {
  try {
    const user = await getAuthUser(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const body = await c.req.json();
    const {
      structureId,
      title,
      pattern,
      professionalUses,
      staticExamples,
      profile,
    } = body as {
      structureId: string;
      title: string;
      pattern: string;
      professionalUses: string[];
      staticExamples: string[];
      profile: {
        position?: string;
        industry?: string;
        seniority?: string;
        targetRole?: string;
        targetCompanyType?: string;
      };
    };

    if (!structureId || !title || !pattern || !staticExamples?.length) {
      return c.json({ error: "Missing required fields", examples: staticExamples ?? [] }, 400);
    }

    const position = profile?.position || "professional";
    const industry = profile?.industry || "technology";
    const seniority = profile?.seniority || "mid-level";
    const targetRole = profile?.targetRole;
    const targetCompanyType = profile?.targetCompanyType;

    const contextDescription = [
      `Current role: ${position}`,
      `Industry: ${industry}`,
      `Seniority: ${seniority}`,
      targetRole ? `Applying for: ${targetRole}` : null,
      targetCompanyType ? `Target company type: ${targetCompanyType}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    const prompt = `You are an expert English communication coach for professionals in nearshoring and global tech.

A user is preparing for a professional interview. Generate exactly 3 example sentences that demonstrate the following grammar structure, personalized to their professional profile.

GRAMMAR STRUCTURE: ${title}
PATTERN: ${pattern}

PROFESSIONAL USES:
${professionalUses.map((u) => `- ${u}`).join("\n")}

USER PROFILE:
${contextDescription}

REQUIREMENTS:
- Each example must clearly demonstrate the grammar pattern
- All examples must be realistic and natural in a professional interview context
- Use vocabulary, roles, metrics, and scenarios that feel authentic to the user's industry and position
- Examples should feel like things THIS person would actually say in an interview
- Keep each example to 1-2 sentences maximum
- Do NOT number the examples
- Do NOT add explanations or labels — only the example sentences

Return ONLY the 3 examples, one per line, nothing else.`;

    const start = Date.now();
    let examples: string[] = staticExamples;

    try {
      const response = await Promise.race([
        callOpenAIChat(
          [{ role: "user", content: prompt }],
          { model: "gpt-4o-mini", max_tokens: 300, temperature: 0.7 }
        ),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("timeout")), 5000)
        ),
      ]);

      const text = (response as string).trim();
      const lines = text
        .split("\n")
        .map((l: string) => l.trim())
        .filter((l: string) => l.length > 0)
        .slice(0, 3);

      if (lines.length === 3) {
        examples = lines;
      } else {
        console.warn(
          `[GrammarExamples] Unexpected response format for ${structureId}, using static fallback`
        );
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[GrammarExamples] Generation failed for ${structureId}:`, message);
      // Fall through to static examples
    }

    const durationMs = Date.now() - start;

    if (examples !== staticExamples) {
      await logApiUsage(user.id, "grammar-examples", {
        model: "gpt-4o-mini",
        structureId,
        durationMs,
      });
    }

    return c.json({ examples });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[GrammarExamples] Unhandled error:", message);
    return c.json({ error: "Internal server error" }, 500);
  }
});

export default app;
