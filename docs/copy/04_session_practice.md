# Copy — Session Flow: Practice & Feedback
> Steps: practice → analyzing → feedback → upsell
> All copy in English.
> Last updated: 2026-05-04

---

## Step: practice
> Live conversation with AI interlocutor. Arena phases progress based on performance.

### Turn counter
- Label: `Turn {N} of {max}`

### Arena phase indicators
> Phases progress automatically — not shown explicitly to user, but inform hint availability.

| Phase | Hint state |
|-------|------------|
| Support | Hints available — collapsed, tap to reveal |
| Guidance | Hints available — less frequent |
| Challenge | Hints hidden — no visible help |

### Hint UI
- Show hint button: `Show hint`
- Hide hint button: `Hide hint`
- Hint section — Starter phrase: `Starter phrase`
- Hint section — Key vocabulary: `Key vocabulary`
- Hint section — Strategy: `Strategy`

### Challenge Mode (user-activated)
- Active indicator: `Challenge Mode — no hints`

### Session controls
- End session button: `End session`
- End session confirmation title: `End this session?`
- End session confirmation body: `Your progress so far will be analyzed and scored.`
- Confirm end: `Yes, end session`
- Cancel: `Keep going`

### Recording states
- Idle: `Tap to speak`
- Recording: `Listening...`
- Processing: `Processing...`

---

## Step: analyzing
> Loader after session ends. Gemini analyzes performance.

Loading messages (rotate):
- `Analyzing your performance...`
- `Scoring fluency and pronunciation...`
- `Reviewing your professional tone...`
- `Generating your feedback...`
- `Almost done...`

---

## Step: feedback
> Results screen. Pillar scores, strengths, opportunities, bottom slot cards.

### Header
- Title: `Session complete.`
- Scenario label: `{Scenario label} · Level {N}`

### Score display
- Overall score label: `Overall score`
- Score format: `{N}/100`

### Pillar breakdown
- Section label: `Pillar breakdown`
- Pillar names:
  - `Vocabulary`
  - `Grammar`
  - `Fluency`
  - `Pronunciation`
  - `Professional Tone`
  - `Persuasion`

### Score level labels (per pillar)
- < 48: `Developing`
- 48–64: `Progressing`
- 65–81: `Proficient`
- 82+: `Advanced`

### Strengths & opportunities
- Strengths section label: `What worked`
- Opportunities section label: `What to work on`
- Content: *(AI-generated per session)*

### Actions
- Download PDF: `Download report`
- Practice again: `Practice again`
- Dashboard: `Back to dashboard`

---

## Bottom slot cards (in order, conditional)

### 1 — WhatsApp SR Coach card
> Shown when: !whatsapp_verified AND card not permanently dismissed

- Title: `Practice between sessions.`
- Body: `Daily pronunciation drills on WhatsApp — drawn from your weak points each session.`
- CTA: `Connect WhatsApp →`
- Dismiss (first): `Later`
- Dismiss (second, permanent): `Don't show again`

### 2 — Path Recommendation card
> Shown only for self-intro sessions with feedback data

- Title: `Your recommended path.`
- Recommendation label: `Based on your session`
- Recommended path: `{PathName}` *(AI-derived)*
- Body: `This path targets your highest-impact gap. Start here.`
- CTA: `Start the program →`

### 3 — Mastery Audit card
> Shown when: profession=product_designer + ≥3 interview sessions in 14 days + no recent audit

- Title: `Ready for a human audit?`
- Body: `You've done the reps. A 30-minute expert review can sharpen what AI scores can't fully capture.`
- CTA: `Book my audit →`
- Cooldown note: `Available once every 30 days`

### 4 — DeepDive card
> Shown when feedback has ≥1 pillar score < 70

- Title: `Lessons for your weak points.`
- Body: `Targeted micro-lessons based on this session.`
- Lesson card CTA: `Read →`
- Audio player label: `Listen`

---

## Step: upsell
> Shown to free users after self-intro sessions are exhausted (3 sessions used).

- Title: `That was your baseline.`
- Body: `You've seen how it works. The 90-day program is where the gap closes — 6 progressive levels, your recommended path, AI feedback on every session.`
- Score callout: `Your starting score: {N}/100. Here's how to move it.`
- CTA: `Start the program →`
- Secondary: `See pricing`
- Free sessions note: `You've used your {N}/3 free sessions.`
