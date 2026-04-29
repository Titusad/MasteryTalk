import { useState, useEffect } from "react";

const STORAGE_KEY = "mt_cookie_consent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
  }, []);

  if (!visible) return null;

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  }

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 bg-[#0f172b] text-white px-4 py-3">
      <div className="max-w-4xl mx-auto flex items-center gap-4 flex-wrap justify-between">
        <p className="text-sm text-[#cbd5e1]">
          We use cookies to keep you signed in and the app running.{" "}
          <a
            href="#cookies"
            className="underline text-white hover:text-[#94a3b8] transition-colors"
            onClick={dismiss}
          >
            Learn more
          </a>
        </p>
        <button
          onClick={dismiss}
          className="bg-white text-[#0f172b] px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-[#f1f5f9] transition-colors shrink-0"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
