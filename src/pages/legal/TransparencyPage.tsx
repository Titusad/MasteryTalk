import { AppHeader } from "@/shared/ui/AppHeader";
import { Sparkles } from "lucide-react";

const LAST_UPDATED = "May 2026";
const CONTACT_EMAIL = "hello@masterytalk.pro";

function Section({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-lg text-[#0f172b] mb-4" style={{ fontWeight: 700 }}>
        {heading}
      </h2>
      {children}
    </section>
  );
}

function Body({ children }: { children: React.ReactNode }) {
  return <p className="text-[#45556c] text-sm leading-relaxed mb-3">{children}</p>;
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2 mb-3">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2 text-sm text-[#45556c]">
          <span className="mt-1 w-1 h-1 rounded-full bg-[#94a3b8] shrink-0" />
          {item}
        </li>
      ))}
    </ul>
  );
}

export function TransparencyPage() {
  return (
    <div aria-label="TransparencyPage" className="min-h-screen bg-white">
      <AppHeader
        variant="public"
        showBackButton
        backLabel="Back"
        onBack={() => { window.location.hash = ""; }}
      />

      <main className="max-w-3xl mx-auto px-6 py-12 md:py-16">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-[#6366f1]" />
          <span className="text-xs font-semibold text-[#6366f1] uppercase tracking-wider">
            Our Commitment
          </span>
        </div>

        <h1
          className="text-3xl md:text-4xl text-[#0f172b] mb-3"
          style={{ fontWeight: 700, lineHeight: 1.2 }}
        >
          AI Transparency Code
        </h1>
        <p className="text-sm text-[#94a3b8] mb-10">Last updated: {LAST_UPDATED}</p>

        <Section heading="An AI-assisted coaching system. Not a fully automated one.">
          <Body>
            MasteryTalk PRO uses artificial intelligence to generate practice scenarios, simulate
            professional interlocutors, and adapt sessions to your specific context. This is what
            makes it available at 2am before your interview — without scheduling, without waiting.
          </Body>
          <Body>
            But AI is not the whole product. The frameworks, the micro-lessons, the evaluation
            criteria, and the learning methodology are designed and maintained by humans. The AI
            executes within those boundaries.
          </Body>
        </Section>

        <Section heading="What AI generates in your session">
          <Body>
            The following content is generated in real time by AI and will vary between sessions:
          </Body>
          <List items={[
            "Your practice brief — the situation, the interlocutor profile, the stakes",
            "The interlocutor's responses during the conversation",
            "The strategy and framework preview before each session",
            "The post-session feedback narrative — strengths, opportunities, language observations",
          ]} />
          <div className="flex items-center gap-2 mt-4 px-4 py-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
            <Sparkles className="w-3.5 h-3.5 text-[#94a3b8] shrink-0" />
            <p className="text-xs text-[#62748e]">
              You will see this icon on screens where content is AI-generated, so you always know.
            </p>
          </div>
        </Section>

        <Section heading="What humans build and maintain">
          <Body>
            The following content is created, reviewed, and updated by the MasteryTalk team:
          </Body>
          <List items={[
            "The micro-lesson library — frameworks, vocabulary, and professional communication techniques",
            "The evaluation pillars and scoring criteria — what counts as proficiency at each level",
            "The scenario architecture — the structure of each practice type and its learning objectives",
            "The interlocutor personas — their psychology, pressure style, and professional behavior",
            "The spaced repetition logic — what gets reinforced and when",
          ]} />
        </Section>

        <Section heading="There is a person behind this.">
          <Body>
            MasteryTalk PRO is not a fully automated pipeline. Every AI instruction set is written,
            tested, and refined by a human. When the system produces something that does not meet
            our standard — a vague brief, an off-target feedback observation, an interlocutor that
            breaks character — we find it, diagnose it, and fix it.
          </Body>
          <Body>
            We review session quality continuously. We update the AI instructions when patterns of
            error appear. We do not ship and forget.
          </Body>
          <Body>This is not a disclaimer. It is how the product is built.</Body>
        </Section>

        <Section heading="What we keep private — and why">
          <Body>
            We do not publish the specific AI models, evaluation logic, or prompt architecture
            behind MasteryTalk PRO.
          </Body>
          <Body>
            This is not to obscure how the product works. It is because the methodology — how
            sessions are structured, how performance is evaluated, how the interlocutor behaves
            under pressure — is the result of significant research and iteration. It is what makes
            the product work.
          </Body>
          <Body>
            What we commit to: the output you receive is honest, the standards are consistent, and
            the system is maintained by a person accountable for its quality.
          </Body>
        </Section>

        <Section heading="Your sessions. Your data.">
          <Body>We handle three types of data differently, and we are explicit about each.</Body>

          <div className="space-y-4">
            <div className="px-4 py-4 rounded-xl border border-[#e2e8f0] bg-[#f8fafc]">
              <p className="text-xs font-semibold text-[#0f172b] uppercase tracking-wider mb-1">Session audio</p>
              <p className="text-sm text-[#45556c]">
                Processed in real time to generate your feedback and pronunciation scores. Not
                stored permanently after the session ends.
              </p>
            </div>
            <div className="px-4 py-4 rounded-xl border border-[#e2e8f0] bg-[#f8fafc]">
              <p className="text-xs font-semibold text-[#0f172b] uppercase tracking-wider mb-1">Performance data</p>
              <p className="text-sm text-[#45556c]">
                Your pillar scores, progression state, and spaced repetition history are retained
                to personalize your experience and track your improvement over time.
              </p>
            </div>
            <div className="px-4 py-4 rounded-xl border border-[#e2e8f0] bg-[#f8fafc]">
              <p className="text-xs font-semibold text-[#0f172b] uppercase tracking-wider mb-1">Professional profile / CV</p>
              <p className="text-sm text-[#45556c]">
                Information you choose to share about your professional background — including any
                resume or CV you upload — is stored only with your explicit authorization. You will
                be asked to consent before this data is saved, and you can withdraw that consent or
                delete it at any time from your account settings.
              </p>
              <p className="text-sm text-[#45556c] mt-2">
                This data is used exclusively to personalize your practice sessions. It is never
                shared with third parties without a separate, explicit consent process.
              </p>
            </div>
          </div>

          <p className="text-[#45556c] text-sm leading-relaxed mt-4">
            You can request full deletion of your data at any time from your account settings.
          </p>
        </Section>

        <div className="border-t border-[#e2e8f0] pt-8 mt-4">
          <p className="text-sm text-[#45556c]">
            Questions about how the product works?{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-[#6366f1] hover:underline"
            >
              Contact us
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
