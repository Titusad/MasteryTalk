/**
 * ══════════════════════════════════════════════════════════════
 *  TermsPage — Terms and Conditions
 *
 *  Public route: #terms
 *  Rendered without authentication.
 *  Matches existing light-mode design system (Inter, slate palette).
 * ══════════════════════════════════════════════════════════════
 */
import { AppHeader } from "@/shared/ui/AppHeader";

const LAST_UPDATED = "April 2025";
const CONTACT_EMAIL = "legal@masterytalk.pro";

export function TermsPage() {
  return (
    <div aria-label="TermsPage" className="min-h-screen bg-white">
      <AppHeader
        variant="public"
        showBackButton
        backLabel="Back"
        onBack={() => window.history.back()}
      />

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 py-12 md:py-16">
        {/* Governance notice */}
        <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-5 py-4 mb-8">
          <p className="text-sm text-[#475569]">
            This agreement is in English as it is governed by the laws of the State of Wyoming, USA.
          </p>
        </div>

        <h1
          className="text-3xl md:text-4xl text-[#0f172b] mb-3"
          style={{ fontWeight: 700, lineHeight: 1.2 }}
        >
          Terms and Conditions
        </h1>
        <p className="text-sm text-[#94a3b8] mb-10">Last updated: {LAST_UPDATED}</p>

        {/* Table of Contents */}
        <nav className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-4 mb-12">
          <p className="text-sm text-[#0f172b] mb-3" style={{ fontWeight: 600 }}>
            Table of Contents
          </p>
          <ol className="space-y-1.5 text-sm text-[#6366f1] list-decimal list-inside">
            <li><a href="#t-acceptance" className="hover:underline">Acceptance of Terms</a></li>
            <li><a href="#t-service" className="hover:underline">Description of Service</a></li>
            <li><a href="#t-accounts" className="hover:underline">User Accounts</a></li>
            <li><a href="#t-plans" className="hover:underline">Freemium Model &amp; Paid Plans</a></li>
            <li><a href="#t-payments" className="hover:underline">Payments &amp; Billing</a></li>
            <li><a href="#t-refunds" className="hover:underline">Cancellation &amp; Refund Policy</a></li>
            <li><a href="#t-conduct" className="hover:underline">Acceptable Use</a></li>
            <li><a href="#t-ip" className="hover:underline">Intellectual Property</a></li>
            <li><a href="#t-thirdparty" className="hover:underline">Third-Party Services</a></li>
            <li><a href="#t-disclaimer" className="hover:underline">Disclaimer of Warranties</a></li>
            <li><a href="#t-liability" className="hover:underline">Limitation of Liability</a></li>
            <li><a href="#t-indemnification" className="hover:underline">Indemnification</a></li>
            <li><a href="#t-changes" className="hover:underline">Changes to Terms</a></li>
            <li><a href="#t-governing" className="hover:underline">Governing Law &amp; Disputes</a></li>
            <li><a href="#t-contact" className="hover:underline">Contact</a></li>
          </ol>
        </nav>

        {/* Sections */}
        <div className="prose-legal space-y-10">
          <Section id="t-acceptance" num="1" title="Acceptance of Terms">
            <p>
              By accessing or using the MasteryTalk platform ("Service"), operated by Spiral Tech Brands LLC, a company
              incorporated in the State of Wyoming, United States, you agree to be bound by these Terms and Conditions
              ("Terms"). If you do not agree, you may not use the Service.
            </p>
            <p>
              Your use of the Service constitutes acceptance of these Terms as of the date of your first use ("Effective Date").
            </p>
          </Section>

          <Section id="t-service" num="2" title="Description of Service">
            <p>
              MasteryTalk is a professional English communication training platform designed for Latin American professionals.
              The Service provides AI-powered practice sessions, pronunciation evaluation, feedback analysis, and personalized
              coaching through voice-based conversations.
            </p>
            <p>
              The Service uses artificial intelligence models from third-party providers (including OpenAI, Google, and
              Microsoft Azure) to deliver its features. The quality and availability of AI-generated content may vary and
              is subject to the capabilities and limitations of these underlying models.
            </p>
          </Section>

          <Section id="t-accounts" num="3" title="User Accounts">
            <p>
              To use the Service, you must create an account using Google OAuth. You are responsible for maintaining the
              confidentiality of your account credentials and for all activities that occur under your account.
            </p>
            <p>
              You agree to provide accurate and complete information during registration. We reserve the right to suspend
              or terminate accounts that provide false information or violate these Terms.
            </p>
          </Section>

          <Section id="t-plans" num="4" title="Freemium Model & Paid Plans">
            <p>
              MasteryTalk offers a freemium model consisting of:
            </p>
            <ul>
              <li>
                <strong>Free tier:</strong> Limited access including one demo practice session per scenario type, with full
                AI coaching, pronunciation evaluation, and detailed feedback.
              </li>
              <li>
                <strong>Paid plans (Learning Paths):</strong> One-time purchase granting permanent access to a set number
                of unique practice sessions with progressive difficulty levels. There are no recurring subscriptions.
              </li>
            </ul>
            <p>
              We reserve the right to modify the features, pricing, and structure of plans at any time. Changes will not
              affect access already purchased.
            </p>
          </Section>

          <Section id="t-payments" num="5" title="Payments & Billing">
            <p>
              All payments are processed through dLocal Go, a third-party payment processor. Spiral Tech Brands LLC does
              not store, process, or have access to your credit card or payment information. All prices are in US Dollars (USD).
            </p>
            <p>
              By purchasing a plan, you authorize dLocal Go to charge the specified amount. You are responsible for any
              applicable taxes in your jurisdiction.
            </p>
          </Section>

          <Section id="t-refunds" num="6" title="Cancellation & Refund Policy">
            <p>
              Since Learning Paths are one-time purchases with permanent access (not subscriptions), there is no cancellation
              process.
            </p>
            <p>
              Refund requests may be submitted within 7 calendar days of purchase to{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#6366f1] hover:underline">{CONTACT_EMAIL}</a>,
              provided you have used no more than 2 sessions from the purchased path. Refunds are issued at our sole discretion
              and will be processed through the original payment method via dLocal Go.
            </p>
          </Section>

          <Section id="t-conduct" num="7" title="Acceptable Use">
            <p>You agree not to:</p>
            <ul>
              <li>Use the Service for any unlawful purpose or in violation of any applicable laws.</li>
              <li>Attempt to reverse-engineer, decompile, or extract source code from the Service.</li>
              <li>Use automated tools, bots, or scripts to access or interact with the Service.</li>
              <li>Harass, abuse, or harm other users or Spiral Tech Brands LLC personnel.</li>
              <li>Upload or transmit malicious code, viruses, or harmful content.</li>
              <li>Resell, redistribute, or commercially exploit the Service without written permission.</li>
            </ul>
          </Section>

          <Section id="t-ip" num="8" title="Intellectual Property">
            <p>
              All content, software, design, branding, and materials on the MasteryTalk platform — including but not limited
              to logos, UI design, coaching scripts, prompt engineering, and evaluation methodologies — are the property of
              Spiral Tech Brands LLC or its licensors and are protected by intellectual property laws.
            </p>
            <p>
              You are granted a limited, non-exclusive, non-transferable license to use the Service for personal,
              non-commercial professional development. This license does not include the right to copy, modify, distribute,
              or create derivative works from any part of the Service.
            </p>
            <p>
              Content generated during your practice sessions (your responses, recordings processed in real-time) remains yours.
              AI-generated coaching content (scripts, feedback, suggestions) is provided under license for your personal use only.
            </p>
          </Section>

          <Section id="t-thirdparty" num="9" title="Third-Party Services">
            <p>
              The Service integrates with third-party services to deliver its features. These include, but are not limited to:
            </p>
            <ul>
              <li>OpenAI (GPT-4o, Whisper, TTS) — conversation AI, transcription, and text-to-speech</li>
              <li>Google (OAuth, Gemini) — authentication and feedback analysis</li>
              <li>Microsoft Azure Speech Services — pronunciation evaluation</li>
              <li>Supabase — database and authentication infrastructure</li>
              <li>Resend — transactional email delivery</li>
              <li>dLocal Go — payment processing</li>
            </ul>
            <p>
              Your use of the Service is also subject to the terms and privacy policies of these third-party providers.
              Spiral Tech Brands LLC is not responsible for the actions, content, or data practices of third-party services.
            </p>
          </Section>

          <Section id="t-disclaimer" num="10" title="Disclaimer of Warranties">
            <p>
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED,
              INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
            </p>
            <p>
              We do not warrant that: (a) the Service will be uninterrupted, timely, secure, or error-free; (b) the results
              from using the Service will be accurate or reliable; (c) the AI-generated content will be free from errors
              or biases.
            </p>
          </Section>

          <Section id="t-liability" num="11" title="Limitation of Liability">
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, SPIRAL TECH BRANDS LLC, ITS DIRECTORS, EMPLOYEES, AND AGENTS SHALL NOT
              BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO
              LOSS OF PROFITS, DATA, USE, OR GOODWILL, ARISING OUT OF OR RELATED TO YOUR USE OF THE SERVICE.
            </p>
            <p>
              Our total aggregate liability for any claims arising from or related to these Terms or the Service shall not
              exceed the amount you have paid to us in the twelve (12) months preceding the claim.
            </p>
          </Section>

          <Section id="t-indemnification" num="12" title="Indemnification">
            <p>
              You agree to indemnify, defend, and hold harmless Spiral Tech Brands LLC and its officers, directors, employees,
              and agents from any claims, liabilities, damages, losses, or expenses (including reasonable attorney's fees)
              arising out of your use of the Service, violation of these Terms, or infringement of any third-party rights.
            </p>
          </Section>

          <Section id="t-changes" num="13" title="Changes to Terms">
            <p>
              We reserve the right to modify these Terms at any time. When we make changes, we will update the "Last updated"
              date and, for material changes, notify you via email or an in-app notification. Your continued use of the
              Service after any changes constitutes acceptance of the revised Terms.
            </p>
          </Section>

          <Section id="t-governing" num="14" title="Governing Law & Disputes">
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the State of Wyoming,
              United States, without regard to its conflict of law provisions.
            </p>
            <p>
              Any disputes arising from or related to these Terms or the Service shall first be attempted to be resolved
              through good-faith negotiation. If not resolved within 30 days, disputes shall be submitted to binding
              arbitration in accordance with the rules of the American Arbitration Association (AAA), with proceedings
              conducted in English. The seat of arbitration shall be Cheyenne, Wyoming.
            </p>
          </Section>

          <Section id="t-contact" num="15" title="Contact">
            <p>
              For questions about these Terms, please contact us at:
            </p>
            <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-4">
              <p style={{ fontWeight: 500 }}>Spiral Tech Brands LLC</p>
              <p>1021 E Lincolnway, Suite 9758</p>
              <p>Cheyenne, WY 82001, United States</p>
              <p>Email: <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#6366f1] hover:underline">{CONTACT_EMAIL}</a></p>
              <p>Website: <a href="https://masterytalk.pro" className="text-[#6366f1] hover:underline">masterytalk.pro</a></p>
            </div>
          </Section>
        </div>
      </main>
    </div>
  );
}

/* ── Section helper ── */
function Section({
  id,
  num,
  title,
  children,
}: {
  id: string;
  num: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2
        className="text-lg text-[#0f172b] mb-3"
        style={{ fontWeight: 600 }}
      >
        {num}. {title}
      </h2>
      <div className="text-[#475569] text-[15px] leading-relaxed space-y-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_strong]:text-[#0f172b] [&_strong]:font-medium">
        {children}
      </div>
    </section>
  );
}
