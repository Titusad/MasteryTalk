# Copy — Dashboard
> All copy in English.
> Last updated: 2026-05-04

---

## HeroCard

- Greeting: `{firstName}.`
- Day counter: `Day {N} of 90`
- Primary path label: `{PathName} · Level {N}`
- Next session CTA: `Start session →`
- War Room CTA: `War Room`
- War Room sessions left: `{N}/5 this month`

---

## WhatsApp verification banner
> Shown when whatsapp_verified = false

- Title: `Add your WhatsApp Coach.`
- Body: `Daily pronunciation drills between sessions — based on your weak points.`
- CTA: `Connect WhatsApp →`
- Dismiss: `Later`

---

## Widget: Progress Summary

- Title: `Your progress`
- Sessions label: `Sessions`
- Average score label: `Avg. score`
- Strongest pillar label: `Strongest area`
- Weakest pillar label: `Focus area`
- Empty state: `Complete your first session to see your progress.`

---

## Widget: SR Dashboard (WhatsApp)

- Title: `WhatsApp SR`
- Phrases mastered: `{N} phrases mastered`
- Not connected: `Not connected`
- Connect CTA: `Connect →`
- Last drill label: `Last drill`
- Next drill label: `Next drill`

---

## Widget: War Room

- Title: `War Room`
- Subtitle: `Any scenario. Immediate access.`
- Sessions used: `{N}/5 sessions this month`
- CTA (available): `Enter War Room →`
- CTA (limit reached): `Limit reached`
- Limit tooltip: `Resets on the 1st of each month`
- Empty month: `5 sessions available this month`

---

## Widget: Platform News

- Title: `What's new`
- Empty state: `No updates right now.`

---

## Progression Tree

### Path states
- Unlocked (active): *(path name + current level indicator)*
- Locked: `Locked`
- Lock condition: `Complete {PathName} to unlock`
- Completed: `Completed`

### Level states
- Available: `Level {N}`
- In progress: `Level {N} · In progress`
- Completed: `Level {N} · Completed`
- Locked: `Level {N} · Locked`

### Level CTA
- Start: `Start level →`
- Continue: `Continue →`
- Review: `Review`

---

## LevelDrawer
> Side panel opened when a level is clicked

- Level label: `Level {N}`
- Sessions in level: `{N} sessions`
- Completion label: `{N}/{total} sessions completed`
- CTA (available): `Start →`
- CTA (in progress): `Continue →`
- CTA (completed): `Completed`
- CTA (locked): `Locked`

---

## RecommendedLessonsCard
> Shown in dashboard when pillarScores available — catch-up between sessions

- Title: `Continue where you left off.`
- Subtitle: `Based on your last session.`
- Lesson CTA: `Read →`
- Audio label: `Listen`
- Empty state: `Complete a session to get personalized lesson recommendations.`

---

## PathPurchaseModal (paywall / upsell)
> Triggered from locked path click, dashboard upsell button, or post-session paywall

- Title: `Unlock the full program.`
- Subtitle: `Your Primary Path from day 1. War Room for urgent practice. AI feedback every session.`

### Founding Member (slots available)
- Badge: `★ Founding Member — {N} slots left`
- Price: `$59 / 3 months`
- Per month equiv: `$19.67/mo — locked forever`
- Value note: `Price locked permanently. Never increases.`

### Program (regular)
- Price: `$129 / 3 months`
- Per month equiv: `$43/mo`

### Monthly
- Price: `$49 / month`
- Note: `No 3-month commitment`

### Shared
- Features included:
  - `Primary Path — all 6 levels`
  - `War Room — 5 sessions/month`
  - `Daily WhatsApp SR Coach`
  - `Full Lessons Library`
  - `AI feedback on every session`
- CTA: `Start program →`
- CTA processing: `Redirecting to Stripe...`
- Legal: `Secure payment via Stripe · Cancel from your account · No hidden fees`

---

## Next Path Selection
> Shown when Primary Path is fully completed — user selects their next path

- Title: `Primary Path complete.`
- Subtitle: `Choose your next path. It unlocks immediately.`
- Path card CTA: `Choose this path →`
- Confirm CTA: `Unlock {PathName} →`
