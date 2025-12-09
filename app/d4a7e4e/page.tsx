"use client";

import { useEffect, useState } from "react";

const TEAM_MEMBERS = ["Laure", "Yiqi", "Cindy"];
const STORAGE_KEY = "abtest-variant";

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export default function ABTestPage() {
  const [variant, setVariant] = useState<"A" | "B" | null>(null);

  // STEP 1: Assign or Load Variant
  useEffect(() => {
    const existing = window.localStorage.getItem(STORAGE_KEY);

    if (existing === "A" || existing === "B") {
      setVariant(existing);

      // STEP 2: Send to GA (returning user)
      window.gtag?.("event", "ab_test_variant", {
        variant_id: existing,     // <-- THIS is what GA will use
        visitor_type: "returning",
      });

      return;
    }

    // New user → assign new variant
    const chosen = Math.random() < 0.5 ? "A" : "B";
    window.localStorage.setItem(STORAGE_KEY, chosen);
    setVariant(chosen);

    // STEP 2: Send to GA (new user)
    window.gtag?.("event", "ab_test_variant", {
      variant_id: chosen,        // <-- SAME param name
      visitor_type: "new",
    });
  }, []);

  if (!variant) return <p>Loading A/B test…</p>;

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
          // Track engagement per variant
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
