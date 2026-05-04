# Copy — WhatsApp SR Coach
> All messages in English (full immersion — every touchpoint reinforces the training environment).
> Outbound messages via Twilio. Inbound audio scored via Azure Speech.
> In-app onboarding UI copy also in English (post-auth surface).
> Last updated: 2026-05-04

---

## In-app onboarding (WhatsApp SR card — FeedbackScreen)

- Title: `Practice between sessions.`
- Body: `Daily pronunciation drills on WhatsApp — drawn from your weak points each session.`
- CTA: `Connect WhatsApp →`

### Phone input step
- Label: `Your WhatsApp number`
- Placeholder: `+1 (555) 000-0000`
- Helper: `We'll send a 6-digit verification code.`
- CTA: `Send code →`

### OTP step
- Label: `Enter the code sent to your WhatsApp`
- Placeholder: `000000`
- CTA: `Verify →`
- Resend: `Resend code`
- Error — invalid code: `That code didn't match. Try again.`
- Error — expired: `Code expired. Request a new one.`

### Time preference step
> Shown after successful OTP verification

- Title: `When do you want your daily drill?`
- Helper: `We'll use your local timezone.`
- Options:
  - `Morning — 7:00 AM`
  - `Midday — 12:00 PM`
  - `Evening — 6:00 PM`
- CTA: `Set schedule →`

### Success state
- Title: `WhatsApp connected.`
- Body: `Your first drill arrives at {preferredTime}. A TTS audio of the correct pronunciation comes with every challenge — listen before you record.`

---

## Outbound messages — Daily challenge

### Format
Two messages sent in sequence:

**Message 1 — Text:**
> Hi, {firstName}. Your pronunciation focus for today is {focusArea}.
>
> Send a voice note saying: "{targetPhrase}"

**Message 2 — Audio:**
> [TTS audio clip — correct pronunciation of the target phrase, voice: cedar]

---

### Focus area examples
- `fluency in date commitments`
- `precision in technical vocabulary`
- `pacing in persuasive statements`
- `intonation in direct requests`
- `clarity in numeric references`

---

## Outbound messages — Feedback

### Good (score ≥ 80)
> Score: {N}/100. '{KeyWord}' — clean. Marked as mastered.
> Next review in {days} days.

### Needs work (score < 80)
> Score: {N}/100. {Specific observation — what broke and where}.
> {One-sentence adjustment}.
> One more.

#### Examples

*Good:*
> Score: 88/100. 'Deliverables' — clean. Marked as mastered.
> Next review in 3 days.

*Needs work:*
> Score: 62/100. Fluency nearly there — the pause before 'align' broke it.
> Connect "need to align" without stopping the airflow.
> One more.

*Needs work (pronunciation):*
> Score: 57/100. 'Leverage' — the second syllable dropped. It's leh-ver-ij, not lev-ridge.
> Try it again, slow the middle.
> One more.

---

## Outbound messages — Milestones

- 5 phrases mastered:
  > 5 phrases mastered. Pronunciation accuracy building.

- 10 phrases mastered:
  > 10 phrases mastered. You're building a reliable range.

- 25 phrases mastered:
  > 25 phrases. Consistent accuracy across vocabulary. Next focus: fluency in transitions.

- 50 phrases mastered:
  > 50 phrases mastered. That's a strong foundation. Shifting to higher-pressure phrases.

---

## Outbound messages — No response (24h inactive)

> Your drill is still open. Send a voice note when you're ready.

---

## Outbound messages — Welcome (first drill)

> Hi, {firstName}. Your WhatsApp SR Coach is active.
>
> Every day at {preferredTime}, you'll get one pronunciation drill based on your session weak points. An audio of the correct pronunciation comes with each challenge — listen, then record.
>
> Your first drill:
>
> Send a voice note saying: "{targetPhrase}"

[TTS audio clip]
