/**
 * ==============================================================
 *  inFluentia PRO — Comprehensive Session Report PDF Generator
 *
 *  Generates a complete PDF combining:
 *  Part 1 — Interview Preparation (briefing data)
 *    - Anticipated questions + approach + key phrases
 *    - Questions to ask the interviewer
 *    - Cultural Quick Tips
 *  Part 2 — Practice Session Feedback (AI analysis)
 *    - Pillar scores + proficiency
 *    - Strengths & key improvements (before/after)
 *    - Preparation Utilization score
 *    - Content insights
 *    - Next steps / session summary
 *
 *  All sections adapt based on available data.
 * ==============================================================
 */

import type { InterviewBriefingData } from "../../services/types";

/* ── Color constants ── */
const DARK = "#0f172a";
const MID = "#475569";
const LIGHT = "#94a3b8";
const ACCENT = "#6366f1";
const BG_LIGHT = "#f8fafc";
const SUCCESS = "#16a34a";
const WARNING = "#d97706";
const DANGER = "#dc2626";

/* ── Interlocutor labels ── */
const INTERLOCUTOR_LABELS: Record<string, string> = {
    recruiter: "Recruiter",
    sme: "Technical Expert (SME)",
    hiring_manager: "Hiring Manager",
    hr: "HR / People & Culture",
};

/* ── Feedback data types (mirrors RealFeedbackData) ── */
export interface ReportFeedbackData {
    strengths?: Array<{ title: string; desc: string }>;
    opportunities?: Array<{ title: string; desc: string }>;
    beforeAfter?: Array<{
        userOriginal: string;
        professionalVersion: string;
        technique?: string;
    }>;
    pillarScores?: Record<string, number> | null;
    professionalProficiency?: number | null;
    contentScores?: Record<string, number> | null;
    interviewReadinessScore?: number | null;
    preparationUtilization?: {
        score: number;
        verdict: string;
        insights: Array<{
            aspect: string;
            observation: string;
            rating: "strong" | "partial" | "missed";
        }>;
    } | null;
    contentInsights?: Array<{
        dimension: string;
        observation: string;
        tip: string;
    }> | null;
}

export interface ReportSummaryData {
    overallSentiment?: string;
    nextSteps?: string[];
    sessionHighlight?: string;
}

/**
 * Generate and download the comprehensive session report PDF.
 */
export async function downloadSessionReportPdf(opts: {
    briefing?: InterviewBriefingData | null;
    interlocutor?: string;
    scenario?: string;
    scenarioType?: string;
    feedback?: ReportFeedbackData | null;
    summary?: ReportSummaryData | null;
    sessionDuration?: string;
    /** User-written drafts from "Your Response" tab, keyed by question id */
    userDrafts?: Record<number, string>;
}): Promise<void> {
    const { briefing, interlocutor = "", scenario, scenarioType, feedback, summary, sessionDuration, userDrafts } = opts;

    const jsPDFModule = await import("jspdf");
    const jsPDF = jsPDFModule.default;
    const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 16;
    const contentWidth = pageWidth - margin * 2;
    let y = margin;

    const interlocutorLabel = INTERLOCUTOR_LABELS[interlocutor] ?? interlocutor;
    const isInterview = scenarioType === "interview";

    /* ── Helper: check page break ── */
    function checkPageBreak(needed: number) {
        if (y + needed > pageHeight - 18) {
            doc.addPage();
            y = margin;
            doc.setDrawColor(ACCENT);
            doc.setLineWidth(0.3);
            doc.line(margin, y, pageWidth - margin, y);
            y += 6;
        }
    }

    /* ── Helper: wrapped text ── */
    function addWrappedText(
        text: string,
        x: number,
        maxWidth: number,
        fontSize: number,
        color: string,
        fontStyle: "normal" | "bold" | "italic" = "normal",
        lineHeight = 5
    ): number {
        doc.setFontSize(fontSize);
        doc.setTextColor(color);
        doc.setFont("helvetica", fontStyle);
        const lines = doc.splitTextToSize(text, maxWidth);
        for (const line of lines) {
            checkPageBreak(lineHeight + 2);
            doc.text(line, x, y);
            y += lineHeight;
        }
        return lines.length;
    }

    /* ── Helper: rounded rectangle ── */
    function roundedRect(rx: number, ry: number, rw: number, rh: number, fillColor: string, radius = 2) {
        doc.setFillColor(fillColor);
        doc.roundedRect(rx, ry, rw, rh, radius, radius, "F");
    }

    /* ── Helper: section title ── */
    function sectionTitle(title: string, addSep = true) {
        if (addSep) {
            y += 4;
            checkPageBreak(20);
            doc.setDrawColor("#e2e8f0");
            doc.setLineWidth(0.3);
            doc.line(margin, y, pageWidth - margin, y);
            y += 6;
        }
        doc.setFontSize(11);
        doc.setTextColor(DARK);
        doc.setFont("helvetica", "bold");
        doc.text(title, margin, y);
        y += 7;
    }

    /* ━━━━━ HEADER ━━━━━ */
    doc.setFillColor(ACCENT);
    doc.rect(0, 0, pageWidth, 2.5, "F");

    y = 10;

    doc.setFontSize(18);
    doc.setTextColor(DARK);
    doc.setFont("helvetica", "bold");
    doc.text(isInterview ? "Interview Session Report" : "Practice Session Report", margin, y);
    y += 7;

    // Subtitle
    doc.setFontSize(9);
    doc.setTextColor(MID);
    doc.setFont("helvetica", "normal");
    const subtitleParts: string[] = [];
    if (interlocutorLabel) subtitleParts.push(`${interlocutorLabel} Interview`);
    if (sessionDuration) subtitleParts.push(`Duration: ${sessionDuration}`);
    if (subtitleParts.length > 0) {
        doc.text(subtitleParts.join("  ·  "), margin, y);
        y += 4.5;
    }
    if (scenario && scenario.length > 0) {
        const scenarioTrimmed = scenario.length > 100 ? scenario.slice(0, 97) + "..." : scenario;
        doc.text(scenarioTrimmed, margin, y);
        y += 3;
    }

    // Separator
    doc.setDrawColor("#e2e8f0");
    doc.setLineWidth(0.3);
    y += 2;
    doc.line(margin, y, pageWidth - margin, y);
    y += 6;

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       PART 1: SESSION FEEDBACK (if available)
       ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
    if (feedback) {
        /* ── Proficiency Score ── */
        const profScore = feedback.professionalProficiency;
        if (typeof profScore === "number" && profScore > 0) {
            doc.setFontSize(9);
            doc.setTextColor(ACCENT);
            doc.setFont("helvetica", "bold");
            doc.text("PROFESSIONAL PROFICIENCY", margin, y);
            y += 5;

            // Score bar
            const barWidth = 60;
            const barHeight = 5;
            roundedRect(margin, y - 3.5, barWidth, barHeight, "#e2e8f0", 2);
            const fillWidth = (profScore / 100) * barWidth;
            const barColor = profScore >= 75 ? SUCCESS : profScore >= 50 ? ACCENT : WARNING;
            roundedRect(margin, y - 3.5, fillWidth, barHeight, barColor, 2);

            doc.setFontSize(10);
            doc.setTextColor(DARK);
            doc.setFont("helvetica", "bold");
            doc.text(`${Math.round(profScore)}%`, margin + barWidth + 4, y);
            y += 6;
        }

        /* ── Interview Readiness Score ── */
        if (isInterview && typeof feedback.interviewReadinessScore === "number") {
            doc.setFontSize(9);
            doc.setTextColor(WARNING);
            doc.setFont("helvetica", "bold");
            doc.text("INTERVIEW READINESS", margin, y);
            y += 5;
            const readinessBarWidth = 60;
            const readinessBarHeight = 5;
            roundedRect(margin, y - 3.5, readinessBarWidth, readinessBarHeight, "#e2e8f0", 2);
            const readinessFill = (feedback.interviewReadinessScore / 100) * readinessBarWidth;
            roundedRect(margin, y - 3.5, readinessFill, readinessBarHeight, WARNING, 2);
            doc.setFontSize(10);
            doc.setTextColor(DARK);
            doc.setFont("helvetica", "bold");
            doc.text(`${Math.round(feedback.interviewReadinessScore)}%`, margin + readinessBarWidth + 4, y);
            y += 6;
        }

        /* ── Preparation Utilization ── */
        if (feedback.preparationUtilization) {
            const pu = feedback.preparationUtilization;
            sectionTitle(`Preparation Score: ${pu.score}% — ${pu.verdict}`);

            for (const ins of pu.insights) {
                checkPageBreak(14);
                const ratingColor = ins.rating === "strong" ? SUCCESS : ins.rating === "partial" ? WARNING : DANGER;
                doc.setFontSize(7.5);
                doc.setTextColor(ratingColor);
                doc.setFont("helvetica", "bold");
                doc.text(`${ins.rating.toUpperCase()} · ${ins.aspect}`, margin + 2, y);
                y += 3.5;
                addWrappedText(ins.observation, margin + 2, contentWidth - 4, 8.5, MID, "normal", 4);
                y += 3;
            }
        }

        /* ── Pillar Scores ── */
        if (feedback.pillarScores && Object.keys(feedback.pillarScores).length >= 4) {
            sectionTitle("Skill Breakdown");
            for (const [skill, score] of Object.entries(feedback.pillarScores)) {
                checkPageBreak(8);
                doc.setFontSize(8.5);
                doc.setTextColor(MID);
                doc.setFont("helvetica", "normal");
                doc.text(skill, margin + 2, y);
                // Mini bar
                const miniBarW = 40;
                const miniBarH = 3.5;
                const bx = margin + 50;
                roundedRect(bx, y - 2.8, miniBarW, miniBarH, "#e2e8f0", 1.5);
                const fW = (score / 100) * miniBarW;
                roundedRect(bx, y - 2.8, fW, miniBarH, ACCENT, 1.5);
                doc.setFontSize(8);
                doc.setTextColor(DARK);
                doc.setFont("helvetica", "bold");
                doc.text(`${Math.round(score)}%`, bx + miniBarW + 3, y);
                y += 5.5;
            }
        }

        /* ── Content Scores (interview) ── */
        if (isInterview && feedback.contentScores && Object.keys(feedback.contentScores).length > 0) {
            sectionTitle("Content Quality");
            for (const [dim, score] of Object.entries(feedback.contentScores)) {
                checkPageBreak(8);
                doc.setFontSize(8.5);
                doc.setTextColor(MID);
                doc.setFont("helvetica", "normal");
                doc.text(dim, margin + 2, y);
                const miniBarW = 40;
                const miniBarH = 3.5;
                const bx = margin + 50;
                roundedRect(bx, y - 2.8, miniBarW, miniBarH, "#e2e8f0", 1.5);
                const fW = (score / 100) * miniBarW;
                roundedRect(bx, y - 2.8, fW, miniBarH, WARNING, 1.5);
                doc.setFontSize(8);
                doc.setTextColor(DARK);
                doc.setFont("helvetica", "bold");
                doc.text(`${Math.round(score)}%`, bx + miniBarW + 3, y);
                y += 5.5;
            }
        }

        /* ── Strengths ── */
        if (feedback.strengths && feedback.strengths.length > 0) {
            sectionTitle("What Worked Well");
            for (const s of feedback.strengths.slice(0, 5)) {
                checkPageBreak(12);
                doc.setFillColor(SUCCESS);
                doc.circle(margin + 2, y - 1.2, 1, "F");
                doc.setFontSize(9);
                doc.setTextColor(DARK);
                doc.setFont("helvetica", "bold");
                doc.text(s.title, margin + 6, y);
                y += 4;
                addWrappedText(s.desc, margin + 6, contentWidth - 8, 8, MID, "normal", 3.5);
                y += 3;
            }
        }

        /* ── Before/After Improvements ── */
        if (feedback.beforeAfter && feedback.beforeAfter.length > 0) {
            sectionTitle("Key Improvements");
            for (const ba of feedback.beforeAfter.slice(0, 5)) {
                checkPageBreak(18);

                doc.setFontSize(7.5);
                doc.setTextColor(DANGER);
                doc.setFont("helvetica", "bold");
                doc.text("BEFORE", margin + 2, y);
                y += 3.5;
                addWrappedText(ba.userOriginal, margin + 2, contentWidth - 4, 8.5, LIGHT, "italic", 4);
                y += 1;

                doc.setFontSize(7.5);
                doc.setTextColor(SUCCESS);
                doc.setFont("helvetica", "bold");
                doc.text("AFTER", margin + 2, y);
                y += 3.5;
                addWrappedText(ba.professionalVersion, margin + 2, contentWidth - 4, 8.5, DARK, "normal", 4);

                if (ba.technique) {
                    y += 1;
                    doc.setFontSize(7.5);
                    doc.setTextColor(WARNING);
                    doc.setFont("helvetica", "italic");
                    doc.text(`Technique: ${ba.technique}`, margin + 2, y);
                    y += 3;
                }
                y += 3;
            }
        }

        /* ── Content Insights ── */
        if (feedback.contentInsights && feedback.contentInsights.length > 0) {
            sectionTitle("Content Coaching");
            for (const ci of feedback.contentInsights) {
                checkPageBreak(14);
                doc.setFontSize(7.5);
                doc.setTextColor(WARNING);
                doc.setFont("helvetica", "bold");
                doc.text(ci.dimension.toUpperCase(), margin + 2, y);
                y += 3.5;
                addWrappedText(ci.observation, margin + 2, contentWidth - 4, 8.5, MID, "normal", 4);
                y += 1;
                addWrappedText(`Tip: ${ci.tip}`, margin + 2, contentWidth - 4, 8, ACCENT, "italic", 3.8);
                y += 3;
            }
        }

        /* ── Session Summary / Next Steps ── */
        if (summary) {
            if (summary.sessionHighlight) {
                sectionTitle("Session Highlight");
                addWrappedText(summary.sessionHighlight, margin + 2, contentWidth - 4, 9, MID, "italic", 4.5);
                y += 2;
            }
            if (summary.nextSteps && summary.nextSteps.length > 0) {
                sectionTitle("Next Steps");
                for (const step of summary.nextSteps) {
                    checkPageBreak(8);
                    doc.setFillColor(ACCENT);
                    doc.circle(margin + 2, y - 1.2, 1, "F");
                    addWrappedText(step, margin + 6, contentWidth - 8, 8.5, MID, "normal", 4);
                    y += 2;
                }
            }
        }
    }

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       PART 2: INTERVIEW PREPARATION CHEAT SHEET (if briefing data)
       ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
    if (briefing) {
        // Start on a new page for the cheat sheet section
        doc.addPage();
        y = margin;

        // Section header
        doc.setFillColor(ACCENT);
        doc.rect(0, 0, pageWidth, 2.5, "F");
        y = 10;

        doc.setFontSize(16);
        doc.setTextColor(DARK);
        doc.setFont("helvetica", "bold");
        doc.text("Interview Cheat Sheet", margin, y);
        y += 6;

        doc.setFontSize(8);
        doc.setTextColor(LIGHT);
        doc.setFont("helvetica", "italic");
        doc.text("Take this to your real interview — your preparation at a glance.", margin, y);
        y += 3;

        doc.setDrawColor("#e2e8f0");
        doc.setLineWidth(0.3);
        y += 2;
        doc.line(margin, y, pageWidth - margin, y);
        y += 6;

        /* ── ANTICIPATED QUESTIONS ── */
        doc.setFontSize(11);
        doc.setTextColor(DARK);
        doc.setFont("helvetica", "bold");
        doc.text("Anticipated Questions", margin, y);
        y += 7;

        for (let qi = 0; qi < briefing.anticipatedQuestions.length; qi++) {
            const q = briefing.anticipatedQuestions[qi];

            checkPageBreak(35);

            // Question number badge + question text
            const badgeSize = 5;
            const badgeY = y - 3.5;
            roundedRect(margin, badgeY, badgeSize, badgeSize, ACCENT, 1.2);
            doc.setFontSize(8);
            doc.setTextColor("#ffffff");
            doc.setFont("helvetica", "bold");
            doc.text(String(qi + 1), margin + 1.7, y - 0.3);

            doc.setFontSize(10);
            doc.setTextColor(DARK);
            doc.setFont("helvetica", "bold");
            const qLines = doc.splitTextToSize(`"${q.question}"`, contentWidth - badgeSize - 4);
            for (const line of qLines) {
                doc.text(line, margin + badgeSize + 3, y);
                y += 4.5;
            }
            y += 1;

            // Approach
            doc.setFontSize(7.5);
            doc.setTextColor(ACCENT);
            doc.setFont("helvetica", "bold");
            doc.text("APPROACH", margin + 2, y);
            y += 3.5;
            addWrappedText(q.approach, margin + 2, contentWidth - 4, 8.5, MID, "normal", 4);
            y += 2;

            // Key phrases
            if (q.keyPhrases && q.keyPhrases.length > 0) {
                doc.setFontSize(7.5);
                doc.setTextColor("#d97706");
                doc.setFont("helvetica", "bold");
                doc.text("KEY PHRASES", margin + 2, y);
                y += 3.5;

                for (const kp of q.keyPhrases) {
                    checkPageBreak(8);
                    const phraseLines = doc.splitTextToSize(`"${kp.phrase}"`, contentWidth - 10);
                    const pillHeight = phraseLines.length * 4 + 3;
                    roundedRect(margin + 2, y - 3, contentWidth - 4, pillHeight, BG_LIGHT, 1.5);

                    doc.setFontSize(8.5);
                    doc.setTextColor(DARK);
                    doc.setFont("helvetica", "italic");
                    for (const line of phraseLines) {
                        doc.text(line, margin + 5, y);
                        y += 4;
                    }
                    y += 1;
                }
            }

            // Pivot
            if (q.pivot) {
                checkPageBreak(8);
                doc.setFontSize(7.5);
                doc.setTextColor("#db2777");
                doc.setFont("helvetica", "bold");
                doc.text("FOLLOW-UP PIVOT", margin + 2, y);
                y += 3.5;
                addWrappedText(q.pivot, margin + 2, contentWidth - 4, 8, MID, "italic", 3.8);
            }

            // User's prepared response (from "Your Response" tab)
            const draftText = userDrafts?.[q.id];
            if (draftText && draftText.trim().length > 0) {
                y += 2;
                checkPageBreak(16);
                doc.setFontSize(7.5);
                doc.setTextColor("#0891b2");
                doc.setFont("helvetica", "bold");
                doc.text("YOUR PREPARED RESPONSE", margin + 2, y);
                y += 3.5;

                // Render draft inside a subtle card
                const draftLines = doc.splitTextToSize(draftText.trim(), contentWidth - 10);
                const draftBlockH = draftLines.length * 4 + 4;
                checkPageBreak(draftBlockH + 2);
                roundedRect(margin + 2, y - 3, contentWidth - 4, draftBlockH, "#f0fdfa", 1.5);
                doc.setFontSize(8.5);
                doc.setTextColor(DARK);
                doc.setFont("helvetica", "normal");
                for (const line of draftLines) {
                    doc.text(line, margin + 5, y);
                    y += 4;
                }
                y += 1;
            }

            // Separator between questions
            y += 4;
            if (qi < briefing.anticipatedQuestions.length - 1) {
                doc.setDrawColor("#e2e8f0");
                doc.setLineWidth(0.15);
                doc.line(margin + 8, y, pageWidth - margin - 8, y);
                y += 5;
            }
        }

        /* ── QUESTIONS TO ASK ── */
        if (briefing.questionsToAsk.length > 0) {
            sectionTitle("Questions to Ask");
            for (let qi = 0; qi < briefing.questionsToAsk.length; qi++) {
                const q = briefing.questionsToAsk[qi];
                checkPageBreak(12);

                doc.setFillColor(ACCENT);
                doc.circle(margin + 2, y - 1.2, 1, "F");

                doc.setFontSize(9);
                doc.setTextColor(DARK);
                doc.setFont("helvetica", "bold");
                const qtaLines = doc.splitTextToSize(`"${q.question}"`, contentWidth - 8);
                for (const line of qtaLines) {
                    doc.text(line, margin + 6, y);
                    y += 4;
                }

                addWrappedText(q.why, margin + 6, contentWidth - 8, 8, LIGHT, "italic", 3.5);
                y += 3;
            }
        }

        /* ── CULTURAL QUICK TIPS ── */
        if (briefing.culturalTips.length > 0) {
            sectionTitle("Cultural Quick Tips (Do / Avoid)");
            for (let ti = 0; ti < briefing.culturalTips.length; ti++) {
                const tip = briefing.culturalTips[ti];
                checkPageBreak(12);

                const isDo = tip.type === "do";
                const badgeText = isDo ? "DO" : "AVOID";
                const badgeColor = isDo ? SUCCESS : DANGER;
                doc.setFontSize(7);
                doc.setTextColor(badgeColor);
                doc.setFont("helvetica", "bold");
                doc.text(badgeText, margin + 2, y);
                y += 3.5;

                doc.setFontSize(9);
                doc.setTextColor(DARK);
                doc.setFont("helvetica", "bold");
                const tipLines = doc.splitTextToSize(tip.title, contentWidth - 8);
                for (const line of tipLines) {
                    doc.text(line, margin + 2, y);
                    y += 4;
                }

                addWrappedText(tip.description, margin + 2, contentWidth - 4, 8, MID, "normal", 3.5);
                y += 3;
            }
        }
    }

    /* ━━━━━ FOOTER (all pages) ━━━━━ */
    const totalPages = doc.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
        doc.setPage(p);
        const footerY = pageHeight - 8;
        doc.setFontSize(7);
        doc.setTextColor(LIGHT);
        doc.setFont("helvetica", "normal");
        doc.text("Generated by inFluentia PRO", margin, footerY);
        doc.text(
            `${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}  ·  Page ${p}/${totalPages}`,
            pageWidth - margin,
            footerY,
            { align: "right" }
        );
    }

    /* ━━━━━ DOWNLOAD ━━━━━ */
    const scenarioSlug = isInterview
        ? `interview-${(interlocutorLabel || "session").toLowerCase().replace(/[^a-z0-9]+/g, "-")}`
        : (scenarioType || "practice").toLowerCase();
    const fileName = `influentia-report-${scenarioSlug}.pdf`;
    doc.save(fileName);
}

/**
 * @deprecated Use downloadSessionReportPdf instead. Kept for backward compat.
 */
export async function downloadCheatSheetPdf(
    briefing: InterviewBriefingData,
    interlocutor: string,
    scenario?: string
): Promise<void> {
    return downloadSessionReportPdf({
        briefing,
        interlocutor,
        scenario,
        scenarioType: "interview",
    });
}