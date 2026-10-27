"use client";
import { useEffect, useState } from 'react';
import { Analytics } from '@vercel/analytics/next';
import Script from 'next/script';
export function ConsentAnalytics({ gaId }: { gaId?: string }) {
  const [accepted, setAccepted] = useState(false);
  useEffect(() => {
    const update = () => {
      let next = false;
      try { next = localStorage.getItem('yaseen-cookie-consent') === 'accepted'; } catch {}
      setAccepted(next);
      // Stop previously loaded GA on revoke; reload removes its running scripts.
      if (gaId) (window as unknown as Record<string, unknown>)[`ga-disable-${gaId}`] = !next;
    };
    update(); window.addEventListener('analytics-consent-changed', update); window.addEventListener('storage', update);
    return () => { window.removeEventListener('analytics-consent-changed', update); window.removeEventListener('storage', update); };
  }, [gaId]);
  if (!accepted) return null;
  return <><Analytics beforeSend={event => { try { return localStorage.getItem('yaseen-cookie-consent') === 'accepted' ? event : null; } catch { return null; } }} />{gaId && /^G-[A-Z0-9]+$/.test(gaId) && <><Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" /><Script id="ga4-init" strategy="afterInteractive">{`window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', '${gaId}');`}</Script></>}</>;
}
