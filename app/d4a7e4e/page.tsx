"use client";

import { useEffect, useState } from "react";

type Variant = "A" | "B";
type VisitorType = "new" | "returning";

const TEAM_MEMBERS = ["Laure", "Yiqi", "Cindy"];
const STORAGE_KEY = "abtest-variant";

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export default function ABTestPage() {
  const [variant, setVariant] = useState<Variant | null>(null);

  useEffect(() => {
    const sendVariantToGA = (v: Variant, visitorType: VisitorType) => {
      // fires once GA is ready
      window.gtag?.("event", "ab_test_variant", {
        variant_id: v,          // used for the custom dimension
        visitor_type: visitorType,
      });
    };

    // wait until GA script has loaded and window.gtag exists
    const timer = setInterval(() => {
      if (!window.gtag) return; // GA not ready yet

      clearInterval(timer);     // GA is ready, stop polling

      const existing = window.localStorage.getItem(STORAGE_KEY) as Variant | null;

      if (existing === "A" || existing === "B") {
        setVariant(existing);
        sendVariantToGA(existing, "returning");
        return;
      }

      // new visitor → assign a variant
      const chosen: Variant = Math.random() < 0.5 ? "A" : "B";
      window.localStorage.setItem(STORAGE_KEY, chosen);
      setVariant(chosen);
      sendVariantToGA(chosen, "new");
    }, 300);

    return () => clearInterval(timer);
  }, []);

  if (!variant) {
    return <p style={{ padding: 40 }}>Loading A/B test…</p>;
  }

  const label = variant === "A" ? "kudos" : "thanks";

  return (
    <main
      style={{
        padding: "40px",
        fontFamily: "system-ui, sans-serif",
        maxWidth: "600px",
        margin: "0 auto",
      }}
    >
      <h1>A/B Test Page</h1>

      <h2>Team Member Nicknames</h2>
      <ul style={{ marginBottom: "32px", paddingLeft: "20px" }}>
        {TEAM_MEMBERS.map((name) => (
          <li key={name}>{name}</li>
        ))}
      </ul>

      <button
        id="abtest"
        onClick={() => {
          // track engagement per variant
          window.gtag?.("event", "abtest_button_click", {
            variant_id: variant,
          });
        }}
        style={{
          padding: "12px 28px",
          backgroundColor: "#1a73e8",
          color: "white",
          border: "none",
          borderRadius: "6px",
          fontSize: "1rem",
          cursor: "pointer",
        }}
      >
        {label}
      </button>

      <p style={{ marginTop: "24px", fontSize: "1.1rem" }}>
        You are seeing variant: <strong>{variant}</strong>
      </p>
    </main>
  );
}
