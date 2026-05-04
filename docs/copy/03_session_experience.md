# Copy — Session Flow: Pre-Practice
> Steps: experience → context → lesson → strategy → interlocutor-intro → generating → practice-prep
> All copy in English (immersion from session start).
> Last updated: 2026-05-04

---

## Step: experience
> User inputs professional background. Used to personalize AI persona and session context.

- Title: `Set your context.`
- Subtitle: `The session adapts to your exact professional situation.`
- Field — Role / Title: `Your role`
- Field — Role placeholder: `e.g. Product Designer, Sales Engineer, Tech Lead`
- Field — Industry: `Industry`
- Field — Industry placeholder: `e.g. Fintech, SaaS, Healthcare`
- Field — Seniority: `Seniority`
- Seniority options: `Junior` · `Mid-level` · `Senior` · `Lead / Manager` · `Director+` · `C-level`
- Field — Company context (optional): `Company or client context` *(optional)*
- Field — Company placeholder: `e.g. U.S.-based startup, Fortune 500, agency`
- CTA: `Continue →`

---

## Step: context
> Situation-specific setup. 3 presets per scenario + optional custom input + Challenge Mode toggle.

- Title: `{Scenario label} — Choose your situation.`
- Preset section label: `Select a scenario`
- Custom option label: `Custom situation`
- Custom placeholder: `Describe the specific situation you want to practice.`
- Challenge Mode toggle label: `Challenge Mode`
- Challenge Mode description: `No hints. No prep notes. Exactly like the real thing.`
- CTA: `Start session →`

### War Room variant
> When startAtContext=true (War Room entry). No lesson step follows.

- Title: `War Room — Choose your scenario.`
- Subtitle: `Pick any situation. No program arc, no prep. Pure practice.`

---

## Step: lesson
> Pre-session micro-lesson. ~90 seconds. CTA locked until user reveals recall answer.

- Screen label: `Before you start`
- Path + level badge: `{Path name} · Level {N}`
- Core concept section: *(AI-generated — 2 sentences max)*
- Power phrase label: `Key phrase`
- Recall section label: `Quick check`
- Recall question: *(AI-generated from lesson data)*
- Reveal button: `Reveal answer`
- CTA (locked): `Start session`
- CTA (unlocked after reveal): `Start session →`
- Skip rules note (not shown to user): *Step skipped in Challenge Mode, War Room, self-intro*

---

## Step: strategy
> Methodology and framework preview. Sets up the user's approach for this session.

- Title: `Your strategy for this session.`
- Framework label: `Framework`
- Objective label: `Session objective`
- CTA: `Enter session →`

---

## Step: interlocutor-intro
> Interview scenario only. AI persona introduces itself in character, in English.

- Screen wrapper label: `Meet your interviewer.`
- Persona intro: *(AI-generated — in character, English only)*
- CTA: `I'm ready →`

---

## Step: generating
> Dynamic loader while session script is generated. Messages rotate every 2–3s.

Loading messages (rotate):
- `Building your session...`
- `Calibrating your interlocutor...`
- `Preparing your brief...`
- `Setting the scenario...`
- `Almost ready...`

### Interview variant (generateInterviewBriefing):
- `Preparing your interview brief...`
- `Calibrating your interviewer...`
- `Setting the pressure level...`

### Sales variant (parallel generation):
- `Building your sales scenario...`
- `Preparing your toolkit...`
- `Calibrating your prospect...`

---

## Step: practice-prep
> Interactive briefing screen before practice begins. User reviews the brief, then confirms ready.

- Title: *(AI-generated briefing title)*
- Content: *(AI-generated — situation, interlocutor profile, key challenge)*
- Section label — Objective: `Your objective`
- Section label — Context: `Situation`
- Section label — Watch for: `Watch for`
- CTA: `Start practice →`
- Secondary: `Review strategy` *(links back to strategy step)*
