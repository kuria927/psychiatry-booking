"use client";

import Script from "next/script";

export function GoogleAnalytics() {
  return (
    <>
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-DEDEKN3T75"
        strategy="afterInteractive"
      />

      <Script id="ga-setup" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-DEDEKN3T75', {
            send_page_view: true
          });
        `}
      </Script>
    </>
  );
}
