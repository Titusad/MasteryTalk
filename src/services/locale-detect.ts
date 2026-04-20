/**
 * ══════════════════════════════════════════════════════════════
 *  MasteryTalk PRO — Silent Locale Detection
 *
 *  Replaces the old "Market Focus" onboarding question with
 *  automatic, privacy-friendly detection based on browser signals.
 *
 *  Used by the Pronunciation Coach to activate language-background
 *  specific phonetic tips (e.g., Portuguese nasalization patterns
 *  vs Spanish /v/-/b/ confusion).
 *
 *  Detection hierarchy:
 *    1. navigator.language / navigator.languages
 *    2. Intl.DateTimeFormat timezone (fallback)
 *    3. "global" if nothing matches
 *
 *  NOTE: This detects the user's LANGUAGE BACKGROUND, not their
 *  "market" or region. A Brazilian in Colombia still benefits
 *  from Portuguese phonetic tips.
 * ══════════════════════════════════════════════════════════════
 */

export type LanguageBackground = "es-mx" | "es-co" | "es" | "pt-br" | "global";

/**
 * Map a LanguageBackground to the pronunciation coach's market key.
 * This bridges the old MarketFocus-based pronunciation directives
 * with the new locale-based detection.
 */
export type PronunciationMarket = "mexico" | "colombia" | "brazil" | null;

/**
 * Detect the user's language background from browser signals.
 * Runs synchronously — no network calls, no tracking.
 */
export function detectLanguageBackground(): LanguageBackground {
    try {
        // ── Step 1: Check navigator.languages (ordered by user preference) ──
        const langs = navigator?.languages ?? [navigator?.language ?? ""];
        for (const lang of langs) {
            const lower = lang.toLowerCase();
            if (lower.startsWith("pt-br") || lower === "pt") return "pt-br";
            if (lower.startsWith("es-mx")) return "es-mx";
            if (lower.startsWith("es-co")) return "es-co";
            if (lower.startsWith("es")) return "es";
        }

        // ── Step 2: Timezone fallback ──
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone ?? "";
        const tzLower = tz.toLowerCase();

        // Brazil timezones
        if (
            tzLower.includes("sao_paulo") ||
            tzLower.includes("fortaleza") ||
            tzLower.includes("recife") ||
            tzLower.includes("manaus") ||
            tzLower.includes("belem") ||
            tzLower.includes("bahia") ||
            tzLower.includes("cuiaba") ||
            tzLower.includes("porto_velho") ||
            tzLower.includes("noronha") ||
            tzLower.includes("araguaina")
        ) {
            return "pt-br";
        }

        // Mexico timezones
        if (
            tzLower.includes("mexico_city") ||
            tzLower.includes("cancun") ||
            tzLower.includes("merida") ||
            tzLower.includes("monterrey") ||
            tzLower.includes("chihuahua") ||
            tzLower.includes("mazatlan") ||
            tzLower.includes("hermosillo") ||
            tzLower.includes("tijuana")
        ) {
            return "es-mx";
        }

        // Colombia timezone
        if (tzLower.includes("bogota")) {
            return "es-co";
        }

        // Other Latin American Spanish
        if (
            tzLower.includes("buenos_aires") ||
            tzLower.includes("santiago") ||
            tzLower.includes("lima") ||
            tzLower.includes("guayaquil") ||
            tzLower.includes("caracas") ||
            tzLower.includes("asuncion") ||
            tzLower.includes("montevideo") ||
            tzLower.includes("la_paz") ||
            tzLower.includes("panama") ||
            tzLower.includes("costa_rica") ||
            tzLower.includes("guatemala") ||
            tzLower.includes("tegucigalpa") ||
            tzLower.includes("managua") ||
            tzLower.includes("el_salvador")
        ) {
            return "es";
        }

        return "global";
    } catch {
        return "global";
    }
}

/**
 * Convert a detected language background to the pronunciation
 * coach's market key (bridges to existing cultural directives).
 */
export function toPronunciationMarket(bg: LanguageBackground): PronunciationMarket {
    switch (bg) {
        case "pt-br":
            return "brazil";
        case "es-mx":
            return "mexico";
        case "es-co":
            return "colombia";
        default:
            return null;
    }
}

/**
 * One-shot helper: detect locale and return the pronunciation market.
 * Use this directly in service adapters.
 */
export function detectPronunciationMarket(): PronunciationMarket {
    return toPronunciationMarket(detectLanguageBackground());
}
