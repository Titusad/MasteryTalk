# Copy — Emails
> All emails in English only (see PRODUCT_SPEC §6.3).
> Transactional: Resend (`hello@masterytalk.pro`)
> Marketing sequences: Loops.so (`mail.go.masterytalk.pro`)
> Implementation: `supabase/functions/make-server-08b8658d/email-templates.ts` (transactional) · Loops dashboard (marketing)
> Last updated: 2026-05-04

---

## Transactional Emails (Resend)

### Email 1 — Welcome
**Trigger:** New user profile created
**Preheader:** `Your AI communication coach is ready. Start your first session free.`

**H1:** `Welcome to MasteryTalk, {userName}.`

**Body:**
> You now have access to the most effective way to sharpen professional English — through real AI-powered practice conversations.
>
> Your first session is free. No credit card. Pick the scenario you need most and start.

**Info card:**
- First session: `Free — no card required`
- AI Coach: `GPT-4o`
- Feedback: `Scored across 6 pillars`

**CTA:** `Start your first session →`

---

### Email 2 — Session Summary
**Trigger:** Post-session feedback generated
**Preheader:** `{scenarioLabel} — Score {score}/100. Full breakdown inside.`

**H1:** `Your {scenarioLabel} results.`

**Body:**
> Here's how you did, {userName}.

**Info card:**
- Overall Score: `{score}/100`
- Scenario: `{scenarioLabel}`

**Pillar breakdown:** *(auto-generated table)*

**Strengths:** *(auto-generated)*

**Focus area:** *(auto-generated — top opportunity)*

**Body:**
> Consistency is what moves the score. Each session builds on the last.

**CTA:** `Practice again →`

---

### Email 3 — Subscription Confirmed
**Trigger:** `checkout.session.completed`
**Preheader:** `Your {planName} is active. Full access unlocked.`

**H1:** `You're in.`

**Body:**
> Your subscription is active, {userName}. Here's what you have access to.

**Info card:**
- Plan: `{planName}`
- Amount: `${amount} USD`
- Next billing: `{nextBillingDate}`

**Features list:**
- `Primary Path — {primaryPathName}, all 6 levels`
- `War Room — 5 sessions/month, any scenario`
- `Daily WhatsApp SR Coach`
- `AI feedback on every session`

**CTA:** `Go to your dashboard →`

**Footer note:** `Questions? Reply to this email.`

---

### Email 4 — Renewal Confirmed (with activity)
**Trigger:** `invoice.payment_succeeded` — user had sessions this cycle
**Preheader:** `{planName} renewed — {sessionsThisMonth} sessions this cycle.`

**H1:** `Renewed. Here's what you built this cycle.`

**Body:**
> Hi {userName} — your subscription renewed and your access continues.

**Progress card:** *(auto-generated: sessions completed, strongest pillar, WA phrases mastered)*

**Billing card:**
- Amount charged: `${amount} USD`
- Next renewal: `{nextBillingDate}`

**CTA:** `Keep going →`

**Footer note:** `Manage your subscription in account settings.`

---

### Email 4B — Renewal Confirmed (no activity)
**Trigger:** `invoice.payment_succeeded` — user had 0 sessions this cycle
**Preheader:** `{planName} renewed — your next session is ready.`

**H1:** `Renewed. You haven't practiced this cycle.`

**Body:**
> Hi {userName} — your {planName} is active, but you haven't used it this cycle.

**Focus card:**
> Your weakest area from your last session: **{weakestPillar}**.
> One session is enough to make a measurable dent.
> *(or: Your paths are fully unlocked. Pick up where you left off.)*

**Body:**
> 15 minutes. The interlocutor is ready.

**CTA:** `Start a session →`

**Footer note:** `Amount charged: ${amount} USD · Next renewal: {nextBillingDate} · Manage subscription`

---

### Email 5 — Inactivity Nudge
**Trigger:** Cron — 7+ days without session, max 1 per 14 days
**Preheader:** `Your session is waiting — pick up where you left off.`

**H1:** `It's been a while.`

**Body:**
> Hi {userName} — you haven't practiced in {daysSinceLastSession} days.
>
> Progress in professional communication is incremental — it compounds session by session. A 15-minute session today is worth more than a long session next month.

**Focus card:**
> Your last session identified **{weakestPillar}** as the area to work on.
> One session. One measurable improvement.

**CTA:** `Resume practice →`

**Footer note:** `You're receiving this because you have an active MasteryTalk PRO subscription. Manage your account.`

---

## Marketing Sequences (Loops.so)

### Loop 1 — Activation (D+2)
**Trigger:** `contact_created` · **Delay:** 2 days · **Filter:** none
**Subject:** `Your communication baseline is waiting`

> There is a gap between what you know and how you communicate it in English.
>
> Your first MasteryTalk PRO session measures it. In 8 minutes, you get a score across 6 pillars — vocabulary, fluency, grammar, pronunciation, professional tone, and persuasion.
>
> No card. No prep. Just talk.

**CTA:** `Start my first session →`

---

### Loop 2 — Conversion (D+5)
**Trigger:** `contact_created` · **Delay:** 5 days
**Filter:** `first_session_completed = true` AND `subscription_purchased = false`
**Subject:** `What the 90-day program actually does`

> You have your baseline score. You know where the gap is.
>
> The 90-day program closes it.
>
> Your Primary Path — chosen from your self-intro results — gives you 6 levels of progressive practice, from foundation to high-pressure scenarios. Each session scores you by pillar. The WhatsApp coach reinforces vocabulary daily between sessions. The gap narrows. The results show in your next client meeting.
>
> Founding Member price: $59 for 3 months. Locked for you permanently. 25 slots total.

**CTA:** `Join the program →`

---

### Loop 3 — Reactivation (D+7)
**Trigger:** `contact_created` · **Delay:** 7 days
**Filter:** `first_session_completed = false`
**Subject:** `8 minutes. That is all it takes.`

> One MasteryTalk PRO session takes 8 minutes.
>
> In 8 minutes you practice the conversation you have this week — the client call, the sprint retro, the interview. The AI scores your fluency, your vocabulary, your professional tone. You finish knowing exactly what to improve.
>
> You do not need a two-hour block. You need 8 minutes.

**CTA:** `Start my first session →`

---

### Loop 4 — Post-session upsell (immediate)
**Trigger:** event `first_session_completed` · **Delay:** 0
**Filter:** `subscription_purchased = false`
**Subject:** `You just saw how it works. Here is what comes next.`

> You completed your first session and received your diagnosis.
>
> That was one session. The 90-day program is 6 levels of your recommended path — each one harder than the last. Interview pressure, sales objections, executive presentations. The AI interlocutor does not accept vague answers or indirect communication. Neither does the real market.
>
> Your score today is your baseline. The program is how you move it.
>
> Founding Member: $59 for 3 months. Price locked permanently for early adopters.

**CTA:** `Start the program →`

---

### Loop 5 — Urgency (D+21)
**Trigger:** `contact_created` · **Delay:** 21 days
**Filter:** `subscription_purchased = false`
**Subject:** `Founding Member: a few slots remain`

> The nearshoring market is at peak demand. U.S. companies are hiring LATAM professionals at record pace.
>
> The filter is not technical skill. It is communication. The professional who leads the meeting, closes the deal, and defends their roadmap in English — that is the one who gets the offer, the promotion, the account.
>
> MasteryTalk PRO builds that capability in 90 days.
>
> 25 Founding Member slots. $59 for 3 months, locked permanently. When they fill, the price moves to $129.

**CTA:** `Secure my spot →`
