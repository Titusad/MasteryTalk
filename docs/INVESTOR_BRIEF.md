# inFluentia PRO — Investor Brief

> **AI-powered professional communication training for Latin American professionals.**
> Prepare. Practice. Perform — in English.

---

## 1. The Opportunity

### Market Context

**700M+ professionals worldwide** need English for work but struggle in high-stakes conversations — job interviews, sales pitches, client meetings, and executive presentations.

In **Latin America alone**, the nearshoring boom (projected $78B by 2027) is creating unprecedented demand for professionals who can communicate effectively in English. Yet existing solutions fail them:

| Existing Solution | Problem |
|---|---|
| Language apps (Duolingo, Babbel) | Teach vocabulary, not professional communication |
| English tutors ($25-50/hr) | Expensive, scheduling friction, inconsistent quality |
| Corporate training programs | Slow, generic, not personalized to real scenarios |
| YouTube / free content | No practice, no feedback, no accountability |

**The gap:** There is no product that lets professionals **rehearse their actual upcoming conversations** with real-time AI feedback on what to say, how to say it, and how to improve.

### Target User

- **Primary:** LATAM professionals (B1+ English) in tech, consulting, sales, and finance
- **Job titles:** Product Managers, UX Designers, Sales Directors, Software Engineers
- **Trigger moments:** Upcoming job interview, investor pitch, client negotiation, performance review
- **Willingness to pay:** High — career-defining outcomes at 10x lower cost than coaching

---

## 2. The Product

### What is inFluentia PRO?

An **AI coach** that simulates professional conversations in English. Users define their real scenario (e.g., "Interview for Senior PM at Stripe"), and the AI creates a personalized preparation + live practice session with granular performance analysis.

### User Flow (8 minutes per session)

```
┌─────────────┐    ┌──────────────┐    ┌─────────────┐    ┌──────────────┐
│  1. SETUP   │ →  │ 2. PRE-BRIEF │ →  │ 3. PRACTICE │ →  │  4. FEEDBACK │
│  Choose     │    │  AI-generated │    │  Voice       │    │  3-pillar    │
│  scenario   │    │  strategy +   │    │  conversation│    │  analysis +  │
│  + context  │    │  script       │    │  with AI     │    │  improvements│
└─────────────┘    └──────────────┘    └─────────────┘    └──────────────┘
                                                                  │
                                            ┌─────────────────────┘
                                            ▼
                                    ┌──────────────┐    ┌──────────────┐
                                    │ 5. RECAP     │    │ 6. DASHBOARD │
                                    │ Session      │    │ Progress     │
                                    │ summary +    │    │ tracking +   │
                                    │ golden script│    │ SR review    │
                                    └──────────────┘    └──────────────┘
```

### Core Features

| Feature | Description | Value |
|---|---|---|
| **AI Script Generation** | Personalized conversation strategy with value pillars, power phrases, and objection handling | Know exactly what to say before the meeting |
| **Voice Practice** | Real-time conversation with AI that responds dynamically as the interviewer/client | Build muscle memory, not just knowledge |
| **Pronunciation Assessment** | Azure-powered word-level accuracy scoring with IPA phonetics | Eliminate accent-related miscommunications |
| **3-Pillar Feedback** | Fluency, vocabulary, and professional communication analysis with before/after examples | Concrete improvements, not vague advice |
| **Golden Master Script** | AI-improved version of everything you said during the session | Ready-to-use polished script |
| **Spaced Repetition** | Auto-extracted phrases from feedback seeded into SR queue for daily review | Long-term retention of improvements |
| **Interview Briefing** | Anticipated questions, STAR frameworks, and cultural tips for specific companies | Company-specific preparation |

### Differentiators

1. **Scenario-specific** — Not generic English practice. Your actual interview, your real product pitch
2. **Full pipeline** — Preparation → Practice → Feedback → Review (not just one piece)
3. **Voice-first** — Speaking practice, not typing exercises
4. **Professional context** — Trained for B2B, negotiations, STAR responses — not casual conversation
5. **Immediate ROI** — Users prepare for a specific event and see results in that event

---

## 3. Technology Stack

### Architecture

```
┌─────────────────────────────────────────────────────┐
│                    FRONTEND                          │
│  React + TypeScript + Vite                          │
│  Hosted on Vercel (global CDN)                      │
│  Motion animations · Responsive design              │
└──────────────────────┬──────────────────────────────┘
                       │ HTTPS
┌──────────────────────▼──────────────────────────────┐
│              SUPABASE EDGE FUNCTIONS                 │
│  Deno runtime · Hono framework                      │
│  Single consolidated endpoint (make-server)          │
│  KV Store for sessions, SR data, vocab tracking      │
├──────────────────────────────────────────────────────┤
│  Supabase Auth (Google OAuth)                        │
│  Supabase Database (PostgreSQL)                      │
│  Supabase KV (Redis-compatible)                      │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│                AI / ML SERVICES                      │
│  OpenAI GPT-4o — Conversation + Analysis             │
│  OpenAI Whisper — Speech-to-Text                     │
│  ElevenLabs — Text-to-Speech (streaming)             │
│  Azure Speech — Pronunciation Assessment             │
└──────────────────────────────────────────────────────┘
```

### Key Technical Advantages

- **Streaming TTS** — ElevenLabs streams audio to client for ~500ms time-to-first-audio (vs 2-3s buffered)
- **Non-blocking architecture** — Pronunciation assessment runs in parallel to conversation, not blocking the user
- **Stale-chunk recovery** — Auto-reload mechanism prevents "white screen" errors after deploys
- **Multi-language UI** — Spanish, Portuguese, and English with full i18n support
- **Pay-per-use** — No server costs at zero usage; scales linearly with demand

---

## 4. Business Model

### Pricing Strategy: Pay-Per-Session (No Subscription)

| Pack | Price | Per Session | Discount |
|------|-------|-------------|----------|
| Free trial | $0.00 | — | 1st session free |
| 1 Session | $4.99 | $4.99 | — |
| 3 Sessions | $12.99 | $4.33 | 13% |
| **5 Sessions** | **$19.99** | **$4.00** | **20%** |

**Why no subscription?** Our target users have **high intent, episodic need** (interview next week, pitch next month). Pay-per-use eliminates the friction of "is this worth $30/month?" and captures higher willingness-to-pay per session.

### Unit Economics

| Metric | Value |
|---|---|
| **Revenue per session (blended)** | ~$4.30 |
| **COGS per session (API costs)** | ~$0.34 |
| **Gross margin** | **92%** |
| **CAC target** | < $5 (organic + referral) |
| **LTV (10 sessions/user)** | ~$40 |
| **LTV:CAC ratio** | 8:1 |

### Cost Breakdown Per Session

| Service | Cost | % of Total |
|---------|------|-----------|
| OpenAI GPT-4o (conversation + analysis) | $0.12 | 35% |
| ElevenLabs TTS (streaming voice) | $0.18 | 53% |
| OpenAI Whisper (transcription) | $0.009 | 3% |
| Azure Speech (pronunciation) | $0.006 | 2% |
| Infrastructure (Supabase) | ~$0.02 | 6% |
| **Total** | **~$0.34** | **100%** |

### Revenue Projections

| Scenario | Monthly Users | Sessions/User | Monthly Revenue | Monthly Profit |
|---|---|---|---|---|
| **Launch (M1-3)** | 100 | 3 | $1,290 | $1,188 |
| **Growth (M4-6)** | 500 | 4 | $8,600 | $7,920 |
| **Scale (M7-12)** | 2,000 | 5 | $40,000 | $36,800 |
| **Mature (Y2)** | 10,000 | 6 | $258,000 | $237,360 |

---

## 5. Go-to-Market Strategy

### Phase 1: Community-Led Growth (Months 1-3)

- **LinkedIn content** targeting LATAM tech professionals (nearshoring, remote work, career growth)
- **Free first session** as lead magnet — zero friction trial
- **Partnerships** with coding bootcamps and career coaching platforms
- **Referral program** — "Give a friend a free session, get a free session"

### Phase 2: Organic Flywheel (Months 4-8)

- **SEO** in Spanish for keywords like "preparar entrevista en inglés", "practicar pitch de ventas"
- **Testimonials & case studies** from early users (salary increases, job offers)
- **Email nurturing** — automated sequences for post-session engagement
- **B2B pilot** — offer team licenses to tech companies with LATAM offices

### Phase 3: Paid Acquisition (Months 9+)

- **Meta/Google Ads** targeting professionals searching for English practice
- **YouTube pre-roll** on career development content
- **Influencer partnerships** with career coaches and English teachers in LATAM
- **Enterprise contracts** for HR departments (onboarding, career development)

### Retention & Engagement Hooks

| Hook | Mechanism |
|---|---|
| **Spaced Repetition** | Daily phrase review cards extracted from sessions |
| **Progress Dashboard** | Skill radar, CEFR tracking, streak counter |
| **Session History** | Re-read past feedback, track improvements over time |
| **Recommended Scenarios** | AI suggests practice based on weak areas |
| **Golden Script Library** | Collect and refine scripts across sessions |

---

## 6. Competitive Landscape

| Competitor | Approach | Price | Limitation |
|---|---|---|---|
| **Duolingo** | Gamified language learning | Free/$7/mo | No professional context, no voice practice |
| **Preply/italki** | Live tutors | $15-40/session | Human availability, inconsistent quality |
| **Elsa Speak** | Pronunciation practice | $12/mo | No conversation practice, no scenario customization |
| **ChatGPT voice** | General AI conversation | $20/mo | No specialized feedback, no preparation pipeline |
| **inFluentia PRO** | **Full-stack professional rehearsal** | **$4-5/session** | **MVP stage, building brand** |

**Our moat:** The combination of scenario-specific preparation + voice practice + multi-dimensional feedback + spaced repetition creates a **complete learning loop** no competitor offers.

---

## 7. Team & Current Status

### Current Status: Working MVP

- ✅ Full product live at [influentia-pro-mvp.vercel.app](https://influentia-pro-mvp.vercel.app)
- ✅ Google OAuth authentication
- ✅ Complete session flow (setup → practice → feedback → recap)
- ✅ ElevenLabs streaming TTS (deployed today)
- ✅ Azure pronunciation assessment
- ✅ Spaced repetition system
- ✅ Interview + Sales Pitch scenarios
- ✅ Multi-language UI (ES/PT/EN)
- ✅ Session history & progress dashboard

### Roadmap (Next 90 Days)

| Priority | Feature | Impact |
|---|---|---|
| 🔴 High | Custom domain + branding | Professional trust |
| 🔴 High | Email service (onboarding + marketing) | Retention |
| 🟡 Medium | Enterprise/team accounts | Revenue expansion |
| 🟡 Medium | Additional scenarios (negotiations, presentations) | TAM expansion |
| 🟢 Nice-to-have | Mobile app (React Native) | Accessibility |
| 🟢 Nice-to-have | Subscription tier | Recurring revenue |

---

## 8. The Ask

### What We Need

- **Seed funding** for marketing, infrastructure scaling, and team expansion
- **Strategic advisors** in EdTech, LATAM market access, and enterprise sales
- **Distribution partners** — coding bootcamps, career platforms, corporate training

### Use of Funds

| Category | Allocation |
|---|---|
| Marketing & User Acquisition | 40% |
| Product Development | 30% |
| Infrastructure & API Costs | 15% |
| Operations & Legal | 15% |

---

## 9. Key Metrics to Track

| Metric | Current | 6-Month Target |
|---|---|---|
| Registered users | MVP beta | 500+ |
| Sessions completed | Testing phase | 2,000+/month |
| Conversion (free → paid) | TBD | 15-25% |
| Average sessions per user | TBD | 5+ |
| NPS | TBD | 50+ |
| Gross margin | 92% | 92%+ |
| Monthly recurring revenue | $0 | $8,000+ |

---

> **inFluentia PRO**: The AI coach that turns good English into great business English.
> Because in your next big meeting, you won't get a second chance to make a first impression.

---

*Contact: [info@influentiapro.com]*
*Product: [influentia-pro-mvp.vercel.app](https://influentia-pro-mvp.vercel.app)*
