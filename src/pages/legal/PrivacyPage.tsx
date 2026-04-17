/**
 * ══════════════════════════════════════════════════════════════
 *  PrivacyPage — Privacy Policy
 *
 *  Public route: #privacy
 *  Rendered without authentication.
 *  Matches existing light-mode design system (Inter, slate palette).
 * ══════════════════════════════════════════════════════════════
 */
import { ArrowLeft } from "lucide-react";
import { BrandLogo } from "@/shared/ui";

const LAST_UPDATED = "April 2025";
const CONTACT_EMAIL = "legal@masterytalk.pro";

export function PrivacyPage() {
  return (
    <div aria-label="PrivacyPage" className="min-h-screen bg-white" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto flex items-center justify-between px-6 h-16">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-sm text-[#4B505B] hover:text-[#0f172b] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <BrandLogo />
        </div>
      </header>

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
          Privacy Policy
        </h1>
        <p className="text-sm text-[#94a3b8] mb-10">Last updated: {LAST_UPDATED}</p>

        {/* Table of Contents */}
        <nav className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-5 mb-12">
          <p className="text-sm text-[#0f172b] mb-3" style={{ fontWeight: 600 }}>
            Table of Contents
          </p>
          <ol className="space-y-1.5 text-sm text-[#6366f1] list-decimal list-inside">
            <li><a href="#p-intro" className="hover:underline">Introduction</a></li>
            <li><a href="#p-collect" className="hover:underline">Information We Collect</a></li>
            <li><a href="#p-use" className="hover:underline">How We Use Your Information</a></li>
            <li><a href="#p-sharing" className="hover:underline">Information Sharing &amp; Third Parties</a></li>
            <li><a href="#p-voice" className="hover:underline">Voice Recordings</a></li>
            <li><a href="#p-storage" className="hover:underline">Data Storage &amp; Security</a></li>
            <li><a href="#p-rights" className="hover:underline">Your Rights</a></li>
            <li><a href="#p-compliance" className="hover:underline">International Compliance</a></li>
            <li><a href="#p-children" className="hover:underline">Children's Privacy</a></li>
            <li><a href="#p-changes" className="hover:underline">Changes to This Policy</a></li>
            <li><a href="#p-contact" className="hover:underline">Contact</a></li>
          </ol>
        </nav>

        {/* Sections */}
        <div className="prose-legal space-y-10">
          <Section id="p-intro" num="1" title="Introduction">
            <p>
              Spiral Tech Brands LLC ("we," "us," or "our"), a company incorporated in the State of Wyoming, United States,
              operates the MasteryTalk platform ("Service") at masterytalk.pro. This Privacy Policy explains how we collect,
              use, disclose, and protect your personal information when you use our Service.
            </p>
            <p>
              By using the Service, you consent to the data practices described in this policy. If you do not agree,
              please do not use the Service.
            </p>
          </Section>

          <Section id="p-collect" num="2" title="Information We Collect">
            <p>We collect the following categories of information:</p>

            <h3>2.1 Information provided through authentication</h3>
            <ul>
              <li><strong>Full name</strong> — as provided by your Google account</li>
              <li><strong>Email address</strong> — as provided by your Google account</li>
              <li><strong>Profile photo URL</strong> — as provided by your Google account</li>
            </ul>

            <h3>2.2 Information generated through use of the Service</h3>
            <ul>
              <li><strong>Session results and practice metrics</strong> — including scores, strengths, areas for improvement, and pillar evaluations</li>
              <li><strong>Session metadata</strong> — scenario type, duration, timestamps</li>
              <li><strong>Progression data</strong> — levels completed, learning path progress</li>
              <li><strong>Context provided by you</strong> — role, company, product descriptions entered during session setup</li>
            </ul>

            <h3>2.3 Technical information</h3>
            <ul>
              <li><strong>Browser type and version</strong></li>
              <li><strong>Device type</strong></li>
              <li><strong>IP address</strong> (logged by our infrastructure providers, not stored by us directly)</li>
            </ul>

            <h3>2.4 Information we do NOT collect</h3>
            <ul>
              <li>Credit card or payment information (processed exclusively by dLocal Go)</li>
              <li>Government-issued identification documents</li>
              <li>Sensitive personal data (racial, ethnic, health, biometric data for identification purposes)</li>
            </ul>
          </Section>

          <Section id="p-use" num="3" title="How We Use Your Information">
            <p>We use your information for the following purposes:</p>
            <ul>
              <li><strong>Service delivery:</strong> To provide, maintain, and improve the AI-powered practice sessions and coaching features.</li>
              <li><strong>Personalization:</strong> To tailor practice scenarios, feedback, and recommendations based on your performance history.</li>
              <li><strong>Communication:</strong> To send transactional emails (welcome, session summaries, subscription confirmations) and important service updates.</li>
              <li><strong>Analytics:</strong> To understand usage patterns and improve the platform (aggregated, anonymized data).</li>
              <li><strong>Legal compliance:</strong> To comply with applicable laws and respond to legal requests.</li>
            </ul>
            <p>
              We do not sell, rent, or trade your personal information to third parties for marketing purposes.
            </p>
          </Section>

          <Section id="p-sharing" num="4" title="Information Sharing & Third Parties">
            <p>
              We share your information only with the following categories of third-party service providers, solely for the
              purpose of operating the Service:
            </p>
            <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl overflow-hidden my-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#e2e8f0]">
                    <th className="text-left px-4 py-3 text-[#0f172b]" style={{ fontWeight: 600 }}>Provider</th>
                    <th className="text-left px-4 py-3 text-[#0f172b]" style={{ fontWeight: 600 }}>Purpose</th>
                    <th className="text-left px-4 py-3 text-[#0f172b]" style={{ fontWeight: 600 }}>Data Shared</th>
                  </tr>
                </thead>
                <tbody className="text-[#475569]">
                  <tr className="border-b border-[#e2e8f0]">
                    <td className="px-4 py-2.5" style={{ fontWeight: 500 }}>OpenAI</td>
                    <td className="px-4 py-2.5">Conversation AI, transcription, text-to-speech</td>
                    <td className="px-4 py-2.5">Session context, voice audio (real-time only)</td>
                  </tr>
                  <tr className="border-b border-[#e2e8f0]">
                    <td className="px-4 py-2.5" style={{ fontWeight: 500 }}>Google</td>
                    <td className="px-4 py-2.5">Authentication (OAuth), feedback analysis (Gemini)</td>
                    <td className="px-4 py-2.5">Auth credentials, session transcripts for analysis</td>
                  </tr>
                  <tr className="border-b border-[#e2e8f0]">
                    <td className="px-4 py-2.5" style={{ fontWeight: 500 }}>Azure Speech Services</td>
                    <td className="px-4 py-2.5">Pronunciation evaluation</td>
                    <td className="px-4 py-2.5">Voice audio (real-time processing only)</td>
                  </tr>
                  <tr className="border-b border-[#e2e8f0]">
                    <td className="px-4 py-2.5" style={{ fontWeight: 500 }}>Supabase</td>
                    <td className="px-4 py-2.5">Database, authentication infrastructure</td>
                    <td className="px-4 py-2.5">User profile, session data, metrics</td>
                  </tr>
                  <tr className="border-b border-[#e2e8f0]">
                    <td className="px-4 py-2.5" style={{ fontWeight: 500 }}>Resend</td>
                    <td className="px-4 py-2.5">Transactional email delivery</td>
                    <td className="px-4 py-2.5">Email address, name</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5" style={{ fontWeight: 500 }}>dLocal Go</td>
                    <td className="px-4 py-2.5">Payment processing</td>
                    <td className="px-4 py-2.5">Payment details (handled directly by dLocal Go — we never see card data)</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              Each provider operates under its own privacy policy and data processing agreements. We do not control how
              these providers handle data beyond the scope of our instructions.
            </p>
          </Section>

          <Section id="p-voice" num="5" title="Voice Recordings">
            <p>
              <strong>MasteryTalk does NOT store voice recordings on its servers.</strong>
            </p>
            <p>
              During practice sessions, your voice is captured by your browser's microphone and sent directly to third-party
              speech processing services (OpenAI Whisper for transcription, Azure Speech Services for pronunciation evaluation)
              in real-time. The audio is processed and discarded immediately — it is not saved, stored, or retained on our
              infrastructure or in any database.
            </p>
            <p>
              What we do store: the resulting text transcriptions and evaluation scores generated from your audio.
              These are used to provide feedback and track your progress.
            </p>
          </Section>

          <Section id="p-storage" num="6" title="Data Storage & Security">
            <p>
              Your data is stored securely using Supabase infrastructure, which leverages Amazon Web Services (AWS) with
              data encryption at rest and in transit. We implement industry-standard security measures including:
            </p>
            <ul>
              <li>TLS/HTTPS encryption for all data in transit</li>
              <li>Row-level security policies at the database level</li>
              <li>Authentication via secure OAuth 2.0 protocols</li>
              <li>Rate limiting on all API endpoints</li>
              <li>Fire-and-forget patterns preventing email delivery failures from exposing user data</li>
            </ul>
            <p>
              While we strive to protect your data, no method of transmission or storage is 100% secure.
              We cannot guarantee absolute security.
            </p>
          </Section>

          <Section id="p-rights" num="7" title="Your Rights">
            <p>
              Depending on your jurisdiction, you may have the following rights regarding your personal data:
            </p>
            <ul>
              <li><strong>Right of access:</strong> Request a copy of the personal data we hold about you.</li>
              <li><strong>Right to rectification:</strong> Request correction of inaccurate or incomplete data.</li>
              <li><strong>Right to deletion:</strong> Request deletion of your personal data ("right to be forgotten").</li>
              <li><strong>Right to data portability:</strong> Request a machine-readable copy of your data.</li>
              <li><strong>Right to restrict processing:</strong> Request that we limit how we use your data.</li>
              <li><strong>Right to object:</strong> Object to certain types of data processing.</li>
              <li><strong>Right to withdraw consent:</strong> Withdraw your consent at any time where processing is based on consent.</li>
            </ul>
            <p>
              To exercise any of these rights, please contact us at{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#6366f1] hover:underline">{CONTACT_EMAIL}</a>.
              We will respond to your request within 30 days.
            </p>
          </Section>

          <Section id="p-compliance" num="8" title="International Compliance">
            <p>
              MasteryTalk serves users primarily in Colombia, Mexico, and Brazil. We are committed to complying with
              applicable data protection regulations in these jurisdictions:
            </p>

            <h3>8.1 European Union — General Data Protection Regulation (GDPR)</h3>
            <p>
              If you are located in the European Economic Area, you have the rights listed in Section 7 above.
              Our legal basis for processing your data includes: (a) your consent, (b) performance of our contract
              with you (these Terms), and (c) our legitimate interests in operating and improving the Service.
            </p>

            <h3>8.2 Colombia — Law 1581 of 2012 (Habeas Data)</h3>
            <p>
              In accordance with Colombian data protection law, you have the right to know, update, rectify, and delete
              your personal data. You may also revoke your authorization for data processing by contacting{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#6366f1] hover:underline">{CONTACT_EMAIL}</a>.
              Spiral Tech Brands LLC acts as the responsible party ("Responsable del tratamiento") for the processing
              of your personal data.
            </p>

            <h3>8.3 Brazil — Lei Geral de Proteção de Dados (LGPD)</h3>
            <p>
              In accordance with Brazil's LGPD, you have the right to access, correct, anonymize, block, or delete
              unnecessary or excessive personal data. You may request information about the entities with which your
              data is shared, and you may revoke consent at any time. The legal basis for data processing includes
              consent, contract performance, and legitimate interest.
            </p>

            <h3>8.4 Mexico — Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP)</h3>
            <p>
              In accordance with Mexico's LFPDPPP, you have ARCO rights (Access, Rectification, Cancellation, and
              Opposition). To exercise these rights, contact{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#6366f1] hover:underline">{CONTACT_EMAIL}</a>.
              We will respond within 20 business days.
            </p>
          </Section>

          <Section id="p-children" num="9" title="Children's Privacy">
            <p>
              The Service is not intended for individuals under the age of 18. We do not knowingly collect personal
              information from children. If we discover that we have collected information from a child under 18,
              we will delete it promptly. If you believe a child has provided us with personal data, please contact
              us at{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#6366f1] hover:underline">{CONTACT_EMAIL}</a>.
            </p>
          </Section>

          <Section id="p-changes" num="10" title="Changes to This Policy">
            <p>
              We may update this Privacy Policy from time to time. When we make changes, we will update the
              "Last updated" date at the top and, for material changes, notify you via email or in-app notification.
              Your continued use of the Service after any modifications constitutes acceptance of the updated policy.
            </p>
          </Section>

          <Section id="p-contact" num="11" title="Contact">
            <p>
              For questions, concerns, or requests regarding this Privacy Policy or your personal data, please contact us at:
            </p>
            <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-4">
              <p style={{ fontWeight: 500 }}>Spiral Tech Brands LLC</p>
              <p>1021 E Lincolnway, Suite 9758</p>
              <p>Cheyenne, WY 82001, United States</p>
              <p>Data Protection Contact: <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#6366f1] hover:underline">{CONTACT_EMAIL}</a></p>
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
      <div className="text-[#475569] text-[15px] leading-relaxed space-y-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_strong]:text-[#0f172b] [&_strong]:font-medium [&_h3]:text-[#0f172b] [&_h3]:font-medium [&_h3]:text-[15px] [&_h3]:mt-4 [&_h3]:mb-1.5">
        {children}
      </div>
    </section>
  );
}
