/**
 * ══════════════════════════════════════════════════════════════
 *  email-templates.ts — HTML templates for transactional emails
 *
 *  DESIGN SYSTEM (matches app exactly):
 *  - Background: #ffffff (white)
 *  - Card surface: #f8fafc / #f1f5f9
 *  - Primary text: #0f172b (slate-900)
 *  - Secondary text: #475569 (slate-600)
 *  - Muted text: #94a3b8 (slate-400)
 *  - Accent: #6366f1 (indigo-500)
 *  - Borders: #e2e8f0 (slate-200)
 *  - CTA: #0f172b bg, white text, rounded-full
 *  - Font: Inter / system fallback
 *
 *  All emails in English. Mobile-responsive (max-width: 600px).
 * ══════════════════════════════════════════════════════════════
 */

const B = {
  name: "MasteryTalk",
  url: "https://masterytalk.pro",
  // Colors — from theme.css + LandingPage.tsx + DashboardPage.tsx
  white: "#ffffff",
  surface: "#f8fafc",
  surfaceAlt: "#f1f5f9",
  text: "#0f172b",
  textSecondary: "#475569",
  textMuted: "#94a3b8",
  accent: "#6366f1",
  accentLight: "#eef2ff",
  border: "#e2e8f0",
  cta: "#0f172b",
  ctaHover: "#1e293b",
  success: "#10b981",
  successLight: "#ecfdf5",
  warning: "#f59e0b",
  danger: "#ef4444",
};

function baseLayout(content: string, preheader: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${B.name}</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
  <style>
    body { margin: 0; padding: 0; background-color: ${B.surfaceAlt}; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased; }
    .wrapper { width: 100%; background-color: ${B.surfaceAlt}; padding: 40px 16px; }
    .container { max-width: 560px; margin: 0 auto; background-color: ${B.white}; border-radius: 16px; overflow: hidden; border: 1px solid ${B.border}; }
    .header { padding: 32px 32px 24px; text-align: center; border-bottom: 1px solid ${B.border}; }
    .header-brand { font-size: 20px; font-weight: 700; color: ${B.text}; letter-spacing: -0.4px; }
    .header-brand span { color: ${B.accent}; }
    .body-content { padding: 32px; }
    .body-content h1 { color: ${B.text}; font-size: 22px; font-weight: 600; margin: 0 0 12px; line-height: 1.35; letter-spacing: -0.3px; }
    .body-content p { color: ${B.textSecondary}; font-size: 14px; line-height: 1.65; margin: 0 0 16px; }
    .body-content .strong-text { color: ${B.text}; font-weight: 500; }
    .card { background: ${B.surface}; border: 1px solid ${B.border}; border-radius: 12px; padding: 0; margin: 20px 0; overflow: hidden; }
    .card-row { padding: 12px 16px; border-bottom: 1px solid ${B.border}; }
    .card-row:last-child { border-bottom: none; }
    .card-label { color: ${B.textMuted}; font-size: 13px; font-weight: 400; }
    .card-value { color: ${B.text}; font-size: 14px; font-weight: 600; }
    .card-value-accent { color: ${B.accent}; font-size: 14px; font-weight: 600; }
    .cta-wrapper { text-align: center; padding: 8px 0 8px; }
    .cta { display: inline-block; padding: 12px 28px; background: ${B.cta}; color: ${B.white} !important; font-size: 14px; font-weight: 500; text-decoration: none; border-radius: 9999px; letter-spacing: 0.1px; }
    .section-title { color: ${B.text}; font-size: 13px; font-weight: 600; margin: 20px 0 8px; text-transform: uppercase; letter-spacing: 0.5px; }
    .check-item { color: ${B.textSecondary}; font-size: 14px; margin: 6px 0; padding-left: 4px; line-height: 1.5; }
    .divider { height: 1px; background: ${B.border}; margin: 24px 0; }
    .focus-card { background: ${B.accentLight}; border: 1px solid #c7d2fe; border-radius: 10px; padding: 14px 16px; margin: 16px 0; }
    .focus-card p { color: ${B.accent}; font-size: 14px; margin: 0; font-weight: 500; }
    .progress-bar-bg { background: ${B.border}; border-radius: 4px; height: 6px; overflow: hidden; }
    .footer { padding: 24px 32px; text-align: center; border-top: 1px solid ${B.border}; background: ${B.surface}; }
    .footer p { color: ${B.textMuted}; font-size: 12px; margin: 3px 0; line-height: 1.5; }
    .footer a { color: ${B.accent}; text-decoration: none; }
    @media only screen and (max-width: 600px) {
      .wrapper { padding: 16px 8px !important; }
      .body-content { padding: 24px 20px !important; }
      .header { padding: 24px 20px 16px !important; }
      .footer { padding: 16px 20px !important; }
    }
  </style>
</head>
<body>
  <span style="display:none;font-size:0;line-height:0;max-height:0;max-width:0;opacity:0;overflow:hidden;">${preheader}</span>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <div style="display: inline-block; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;">
          <span style="font-size: 20px; font-weight: 700; color: #1C0B1E; letter-spacing: -0.4px;">MasteryTalk</span><!--
          --><span style="display: inline-block; width: 5px; height: 5px; border-radius: 50%; background: #00D3F3; margin: 0 2px; vertical-align: middle;"></span><!--
          --><span style="font-family: 'Montserrat', 'Inter', sans-serif; font-size: 16px; font-weight: 700; color: #00D3F3;">pro</span>
        </div>
      </div>
      ${content}
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} ${B.name}. All rights reserved.</p>
        <p><a href="${B.url}">masterytalk.pro</a></p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

/* ═══════════════════════════════════════════════════════════════
   1. WELCOME EMAIL — Triggered on first login (ensure-profile)
   ═══════════════════════════════════════════════════════════════ */

export function welcomeEmailHtml(userName: string): string {
  const content = `
    <div class="body-content">
      <h1>Welcome to ${B.name}, ${userName}!</h1>
      <p class="strong-text">
        You've just unlocked the most effective way to master professional
        English — through realistic AI-powered practice conversations.
      </p>
      <p>
        Whether you're preparing for a job interview, a sales pitch, or an
        executive presentation, MasteryTalk gives you a safe space to practice,
        get real-time feedback, and build the confidence you need.
      </p>

      <div class="card">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td class="card-row" style="padding: 12px 16px; border-bottom: 1px solid ${B.border};">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="color: ${B.textMuted}; font-size: 13px;">Your first session</td>
                  <td style="color: ${B.accent}; font-size: 14px; font-weight: 600; text-align: right;">Free</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td class="card-row" style="padding: 12px 16px; border-bottom: 1px solid ${B.border};">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="color: ${B.textMuted}; font-size: 13px;">AI Coach</td>
                  <td style="color: ${B.text}; font-size: 14px; font-weight: 600; text-align: right;">GPT-4o powered</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 16px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="color: ${B.textMuted}; font-size: 13px;">Feedback</td>
                  <td style="color: ${B.text}; font-size: 14px; font-weight: 600; text-align: right;">Detailed analysis</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </div>

      <p>
        Ready to start? Your first practice session is completely free — no
        credit card required.
      </p>
      <div class="cta-wrapper">
        <a href="${B.url}/#dashboard" class="cta">Start Your First Session &rarr;</a>
      </div>
    </div>`;

  return baseLayout(content, `Welcome to ${B.name}! Your AI-powered English coach is ready.`);
}

/* ═══════════════════════════════════════════════════════════════
   2. SESSION SUMMARY EMAIL — Triggered after feedback analysis
   ═══════════════════════════════════════════════════════════════ */

export interface SessionSummaryEmailData {
  userName: string;
  scenarioType: string;
  professionalProficiency: number | null;
  strengths: string[];
  topOpportunity: string | null;
  pillarScores: Record<string, number> | null;
}

export function sessionSummaryEmailHtml(data: SessionSummaryEmailData): string {
  const scenarioLabels: Record<string, string> = {
    interview: "Job Interview",
    sales: "Sales Pitch",
    negotiation: "Negotiation",
    networking: "Networking",
    csuite: "Executive Presentation",
  };

  const scenarioLabel = scenarioLabels[data.scenarioType] || data.scenarioType || "Practice Session";
  const score = data.professionalProficiency ?? "—";
  const topStrengths = (data.strengths || []).slice(0, 3);

  // Build pillar rows
  let pillarHtml = "";
  if (data.pillarScores && Object.keys(data.pillarScores).length > 0) {
    const rows = Object.entries(data.pillarScores)
      .map(([key, val]) => {
        const label = key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
        const barWidth = Math.min(100, Math.max(5, val));
        const barColor = val >= 70 ? B.success : val >= 40 ? B.warning : B.danger;
        return `
          <tr>
            <td style="padding: 6px 16px; color: ${B.textSecondary}; font-size: 13px; width: 35%;">${label}</td>
            <td style="padding: 6px 4px; width: 50%;">
              <div style="background: ${B.border}; border-radius: 4px; height: 6px; overflow: hidden;">
                <div style="background: ${barColor}; width: ${barWidth}%; height: 100%; border-radius: 4px;"></div>
              </div>
            </td>
            <td style="padding: 6px 16px; color: ${B.text}; font-size: 13px; font-weight: 600; text-align: right; width: 15%;">${val}</td>
          </tr>`;
      })
      .join("");

    pillarHtml = `
      <p class="section-title" style="color: ${B.text}; font-size: 13px; font-weight: 600; margin: 20px 0 8px; text-transform: uppercase; letter-spacing: 0.5px;">Skill Breakdown</p>
      <div class="card" style="background: ${B.surface}; border: 1px solid ${B.border}; border-radius: 12px; margin: 8px 0 16px; overflow: hidden;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          ${rows}
        </table>
      </div>`;
  }

  const strengthsHtml = topStrengths.length > 0
    ? `<p class="section-title" style="color: ${B.text}; font-size: 13px; font-weight: 600; margin: 20px 0 8px; text-transform: uppercase; letter-spacing: 0.5px;">Top Strengths</p>
       ${topStrengths.map(s => `<p style="color: ${B.textSecondary}; font-size: 14px; margin: 6px 0; padding-left: 4px; line-height: 1.5;">✓ ${s}</p>`).join("")}`
    : "";

  const focusHtml = data.topOpportunity
    ? `<div style="background: ${B.accentLight}; border: 1px solid #c7d2fe; border-radius: 10px; padding: 14px 16px; margin: 16px 0;">
        <p style="color: ${B.text}; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 4px;">Focus Area</p>
        <p style="color: ${B.accent}; font-size: 14px; margin: 0; font-weight: 500;">${data.topOpportunity}</p>
       </div>`
    : "";

  const content = `
    <div class="body-content">
      <h1>Your Session Results</h1>
      <p class="strong-text">
        Great work on your <strong>${scenarioLabel}</strong> practice, ${data.userName}!
        Here's a snapshot of how you did.
      </p>

      <div class="card" style="background: ${B.surface}; border: 1px solid ${B.border}; border-radius: 12px; overflow: hidden;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="padding: 14px 16px; border-bottom: 1px solid ${B.border};">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="color: ${B.textMuted}; font-size: 13px;">Overall Score</td>
                  <td style="color: ${B.accent}; font-size: 22px; font-weight: 700; text-align: right;">${score}<span style="font-size: 13px; color: ${B.textMuted}; font-weight: 400;">/100</span></td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 16px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="color: ${B.textMuted}; font-size: 13px;">Scenario</td>
                  <td style="color: ${B.text}; font-size: 14px; font-weight: 600; text-align: right;">${scenarioLabel}</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </div>

      ${pillarHtml}
      ${strengthsHtml}
      ${focusHtml}

      <div class="divider" style="height: 1px; background: ${B.border}; margin: 24px 0;"></div>
      <p>
        Consistency is the key to progress. Each session builds on the last —
        keep the momentum going!
      </p>
      <div class="cta-wrapper">
        <a href="${B.url}/#dashboard" class="cta">Practice Again &rarr;</a>
      </div>
    </div>`;

  return baseLayout(content, `Your ${scenarioLabel} results: Score ${score}/100 — see full breakdown.`);
}

/* ═══════════════════════════════════════════════════════════════
   3. SUBSCRIPTION CONFIRMATION — Triggered by payment webhook
   ═══════════════════════════════════════════════════════════════ */

export interface SubscriptionEmailData {
  userName: string;
  planName: string;
  amountUsd: number;
  nextBillingDate: string;
}

export function subscriptionConfirmationEmailHtml(data: SubscriptionEmailData): string {
  const content = `
    <div class="body-content">
      <h1>You're All Set!</h1>
      <p class="strong-text">
        Thank you for upgrading, ${data.userName}! Your subscription is now active and you have
        full access to everything MasteryTalk has to offer.
      </p>

      <div class="card" style="background: ${B.surface}; border: 1px solid ${B.border}; border-radius: 12px; overflow: hidden;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="padding: 12px 16px; border-bottom: 1px solid ${B.border};">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="color: ${B.textMuted}; font-size: 13px;">Plan</td>
                  <td style="color: ${B.accent}; font-size: 14px; font-weight: 700; text-align: right;">${data.planName}</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 16px; border-bottom: 1px solid ${B.border};">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="color: ${B.textMuted}; font-size: 13px;">Amount</td>
                  <td style="color: ${B.text}; font-size: 14px; font-weight: 600; text-align: right;">$${data.amountUsd.toFixed(2)} USD</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 16px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="color: ${B.textMuted}; font-size: 13px;">Next billing</td>
                  <td style="color: ${B.text}; font-size: 14px; font-weight: 600; text-align: right;">${data.nextBillingDate}</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </div>

      <p>
        With your subscription you get unlimited practice sessions, detailed pronunciation
        analysis, and advanced coaching feedback on every conversation.
      </p>
      <div class="cta-wrapper">
        <a href="${B.url}/#dashboard" class="cta">Go to Dashboard &rarr;</a>
      </div>
      <div class="divider" style="height: 1px; background: ${B.border}; margin: 24px 0;"></div>
      <p style="font-size: 13px; color: ${B.textMuted};">
        Need help? Just reply to this email and we'll get back to you.
      </p>
    </div>`;

  return baseLayout(content, `Your ${data.planName} subscription is active — full access unlocked!`);
}

/* ── Renewal confirmation ── */

export interface RenewalEmailData {
  userName: string;
  planName: string;
  amountUsd: number;
  nextBillingDate: string;
}

export function renewalConfirmationEmailHtml(data: RenewalEmailData): string {
  const content = `
    <div class="body-content">
      <h1>Subscription Renewed</h1>
      <p class="strong-text">
        Hi ${data.userName}! Your ${data.planName} subscription has been successfully renewed.
        Your access continues without interruption.
      </p>

      <div class="card" style="background: ${B.surface}; border: 1px solid ${B.border}; border-radius: 12px; overflow: hidden;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="padding: 12px 16px; border-bottom: 1px solid ${B.border};">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="color: ${B.textMuted}; font-size: 13px;">Plan</td>
                  <td style="color: ${B.accent}; font-size: 14px; font-weight: 700; text-align: right;">${data.planName}</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 16px; border-bottom: 1px solid ${B.border};">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="color: ${B.textMuted}; font-size: 13px;">Amount charged</td>
                  <td style="color: ${B.text}; font-size: 14px; font-weight: 600; text-align: right;">$${data.amountUsd.toFixed(2)} USD</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 16px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="color: ${B.textMuted}; font-size: 13px;">Next renewal</td>
                  <td style="color: ${B.text}; font-size: 14px; font-weight: 600; text-align: right;">${data.nextBillingDate}</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </div>

      <p>
        Keep up the momentum — every session brings you closer to executive-level English fluency.
      </p>
      <div class="cta-wrapper">
        <a href="${B.url}/#dashboard" class="cta">Practice Now &rarr;</a>
      </div>
      <div class="divider" style="height: 1px; background: ${B.border}; margin: 24px 0;"></div>
      <p style="font-size: 13px; color: ${B.textMuted};">
        To manage your subscription, visit your <a href="${B.url}/#account" style="color: ${B.accent};">account settings</a>.
      </p>
    </div>`;

  return baseLayout(content, `${data.planName} renewed — your access continues!`);
}

/* ── Inactivity nudge ── */

export function inactivityNudgeEmailHtml(userName: string): string {
  const content = `
    <div class="body-content">
      <h1>Your English isn't going to practice itself.</h1>
      <p class="strong-text">
        Hi ${userName} — it's been a while since your last session.
      </p>
      <p>
        The professionals who achieve real fluency don't wait for the perfect moment.
        They practice even when they're busy — especially then.
      </p>

      <div class="focus-card">
        <p>
          💡 <strong>10 minutes today</strong> compounds into executive-level English over weeks.
          Your practice paths are waiting.
        </p>
      </div>

      <p>
        Pick up where you left off — your progress is saved and your paths are fully unlocked.
      </p>
      <div class="cta-wrapper">
        <a href="${B.url}/#dashboard" class="cta">Resume Practice &rarr;</a>
      </div>
      <div class="divider" style="height: 1px; background: ${B.border}; margin: 24px 0;"></div>
      <p style="font-size: 13px; color: ${B.textMuted};">
        You're receiving this because you have an active MasteryTalk PRO subscription.
        <a href="${B.url}/#account" style="color: ${B.accent};">Manage your account</a>.
      </p>
    </div>`;

  return baseLayout(content, "Your English isn't going to practice itself — come back!");
}
