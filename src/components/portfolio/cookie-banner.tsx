"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie } from "lucide-react";

const KEY = "yaseen-cookie-consent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) {
        const t = setTimeout(() => setVisible(true), 1200);
        return () => clearTimeout(t);
      }
    } catch {
      setVisible(true);
    }
  }, []);

  const choose = (value: "accepted" | "declined") => {
    try {
      localStorage.setItem(KEY, value);
    } catch {
      /* storage unavailable — just dismiss */
    }
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.3 }}
          role="dialog"
          aria-live="polite"
          aria-label="Cookie consent"
          className="fixed bottom-4 left-4 right-4 z-[90] mx-auto max-w-xl rounded-xl border border-[#E6E8E2] bg-white/95 p-5 shadow-[0_16px_48px_rgba(16,20,16,0.16)] backdrop-blur sm:bottom-6 sm:left-6 sm:right-auto"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#F4F5F1] text-[#166534]">
              <Cookie className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#101410]">
                A quick note on cookies
              </p>
              <p className="mt-1 text-xs leading-relaxed text-[#5F665F]">
                This site uses anonymous analytics to understand traffic. No
                advertising or cross-site tracking. See the{" "}
                <a
                  href="/privacy"
                  className="font-medium text-[#166534] underline underline-offset-2"
                >
                  privacy policy
                </a>
                .
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => choose("accepted")}
                  className="rounded-full bg-[#101410] px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-black"
                >
                  Accept
                </button>
                <button
                  onClick={() => choose("declined")}
                  className="rounded-full border border-[#E6E8E2] px-4 py-2 text-xs font-medium text-[#101410] transition-colors hover:border-[#101410]"
                >
                  Decline
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
