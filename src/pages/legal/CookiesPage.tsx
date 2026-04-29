import { AppHeader } from "@/shared/ui/AppHeader";

const LAST_UPDATED = "April 2026";
const CONTACT_EMAIL = "legal@masterytalk.pro";

export function CookiesPage() {
  return (
    <div aria-label="CookiesPage" className="min-h-screen bg-white" style={{ fontFamily: "'Inter', sans-serif" }}>
      <AppHeader
        variant="public"
        showBackButton
        backLabel="Back"
        onBack={() => window.history.back()}
      />

      <main className="max-w-3xl mx-auto px-6 py-12 md:py-16">
        <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-5 py-4 mb-8">
          <p className="text-sm text-[#475569]">
            This policy is in English as it is governed by the laws of the State of Wyoming, USA.
          </p>
        </div>

        <h1 className="text-3xl md:text-4xl text-[#0f172b] mb-3" style={{ fontWeight: 700, lineHeight: 1.2 }}>
          Cookie Policy
        </h1>
        <p className="text-sm text-[#94a3b8] mb-10">Last updated: {LAST_UPDATED}</p>

        <nav className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-4 mb-12">
          <p className="text-sm text-[#0f172b] mb-3" style={{ fontWeight: 600 }}>Table of Contents</p>
          <ol className="space-y-1.5 text-sm text-[#6366f1] list-decimal list-inside">
            <li><a href="#c-what" className="hover:underline">What Are Cookies</a></li>
            <li><a href="#c-use" className="hover:underline">How We Use Cookies</a></li>
            <li><a href="#c-storage" className="hover:underline">Local Storage</a></li>
            <li><a href="#c-third" className="hover:underline">Third-Party Cookies</a></li>
            <li><a href="#c-control" className="hover:underline">Your Control</a></li>
            <li><a href="#c-contact" className="hover:underline">Contact</a></li>
          </ol>
        </nav>

        <div className="prose-legal space-y-10">
          <Section id="c-what" num="1" title="What Are Cookies">
            <p>
              Cookies are small text files placed on your device by a website when you visit it. They allow the site
              to remember information about your visit — such as whether you are logged in — so that the experience
              works correctly on your next visit.
            </p>
            <p>
              MasteryTalk uses only <strong>strictly necessary cookies</strong>. These are cookies without which the
              Service cannot function. They do not track you across other websites and do not require your consent
              under applicable data protection law.
            </p>
          </Section>

          <Section id="c-use" num="2" title="How We Use Cookies">
            <p>The following cookies are set when you use MasteryTalk:</p>
            <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl overflow-hidden my-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#e2e8f0]">
                    <th className="text-left px-4 py-3 text-[#0f172b]" style={{ fontWeight: 600 }}>Cookie</th>
                    <th className="text-left px-4 py-3 text-[#0f172b]" style={{ fontWeight: 600 }}>Provider</th>
                    <th className="text-left px-4 py-3 text-[#0f172b]" style={{ fontWeight: 600 }}>Purpose</th>
                    <th className="text-left px-4 py-3 text-[#0f172b]" style={{ fontWeight: 600 }}>Duration</th>
                  </tr>
                </thead>
                <tbody className="text-[#475569]">
                  <tr className="border-b border-[#e2e8f0]">
                    <td className="px-4 py-2.5 font-mono text-xs">sb-*-auth-token</td>
                    <td className="px-4 py-2.5">Supabase</td>
                    <td className="px-4 py-2.5">Keeps you signed in between sessions</td>
                    <td className="px-4 py-2.5">Session / persistent</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 font-mono text-xs">Google OAuth</td>
                    <td className="px-4 py-2.5">Google</td>
                    <td className="px-4 py-2.5">Handles Sign in with Google authentication</td>
                    <td className="px-4 py-2.5">Session</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              We do not set advertising, analytics, or tracking cookies. We do not use cookies to identify you
              across third-party websites.
            </p>
          </Section>

          <Section id="c-storage" num="3" title="Local Storage">
            <p>
              In addition to cookies, MasteryTalk uses your browser's <strong>localStorage</strong> to store
              lightweight preferences on your device. This data never leaves your browser and is not accessible
              to us or any third party.
            </p>
            <p>Specifically, we store:</p>
            <ul>
              <li><strong>Language preference</strong> — the landing page language you selected (ES/PT/EN)</li>
              <li><strong>Narration preference</strong> — whether the guided audio narration is muted</li>
              <li><strong>Cookie consent acknowledgement</strong> — records that you have seen this notice</li>
              <li><strong>Session cache</strong> — temporary practice session data to avoid data loss on page refresh</li>
            </ul>
            <p>
              You can clear localStorage at any time through your browser's developer tools or site settings.
              Doing so will reset your language and narration preferences.
            </p>
          </Section>

          <Section id="c-third" num="4" title="Third-Party Cookies">
            <p>
              Some third-party services we integrate with may set their own cookies during your session. These
              are strictly limited to services necessary for the platform to operate:
            </p>
            <ul>
              <li><strong>Google (OAuth / Gemini)</strong> — authentication and feedback analysis</li>
              <li><strong>Stripe</strong> — payment processing (only when you initiate a purchase)</li>
              <li><strong>Sentry</strong> — error monitoring (may set a session identifier to link error reports)</li>
            </ul>
            <p>
              Each of these providers operates under its own cookie and privacy policy. We do not control the
              cookies set by these services beyond what is required for basic integration.
            </p>
          </Section>

          <Section id="c-control" num="5" title="Your Control">
            <p>
              Because we only use strictly necessary cookies, disabling them will affect the core functionality
              of the Service. Specifically:
            </p>
            <ul>
              <li>Disabling authentication cookies will prevent you from staying signed in.</li>
              <li>Blocking third-party cookies may prevent Google Sign-In from working.</li>
            </ul>
            <p>
              You can manage or delete cookies through your browser settings. Most browsers allow you to block
              all cookies, block third-party cookies only, or clear existing cookies. Refer to your browser's
              help documentation for instructions.
            </p>
          </Section>

          <Section id="c-contact" num="6" title="Contact">
            <p>
              If you have questions about how MasteryTalk uses cookies or local storage, contact us at:
            </p>
            <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-4">
              <p style={{ fontWeight: 500 }}>Spiral Tech Brands LLC</p>
              <p>1021 E Lincolnway, Suite 9758</p>
              <p>Cheyenne, WY 82001, United States</p>
              <p>
                Legal:{" "}
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#6366f1] hover:underline">
                  {CONTACT_EMAIL}
                </a>
              </p>
            </div>
          </Section>
        </div>
      </main>
    </div>
  );
}

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
      <h2 className="text-lg text-[#0f172b] mb-3" style={{ fontWeight: 600 }}>
        {num}. {title}
      </h2>
      <div className="text-[#475569] text-[15px] leading-relaxed space-y-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_strong]:text-[#0f172b] [&_strong]:font-medium">
        {children}
      </div>
    </section>
  );
}
