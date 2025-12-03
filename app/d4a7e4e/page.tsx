"use client";

import { useEffect, useState } from "react";

const TEAM_MEMBERS = ["Laure", "Yiqi", "Cindy"];

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export default function ABTestPage() {
  const [variant, setVariant] = useState<string | null>(null);

  useEffect(() => {
    const storageKey = "abtest-variant";

    // If user already assigned a variant
    const existing = window.localStorage.getItem(storageKey);
    if (existing === "A" || existing === "B") {
      setVariant(existing);

      // Analytics: track returning users
      window.gtag?.("event", "ab_test_variant", {
        variant: existing,
        visitor_type: "returning",
      });

      return;
    }

    // Assign new variant
    const chosen = Math.random() < 0.5 ? "A" : "B";
    window.localStorage.setItem(storageKey, chosen);
    setVariant(chosen);

    // Analytics: track first-time assignment
    window.gtag?.("event", "ab_test_variant", {
      variant: chosen,
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
        style={{
          padding: "12px 28px",
          backgroundColor: "#1a73e8",
          color: "white",
          border: "none",
          borderRadius: "6px",
          fontSize: "1rem",
          cursor: "pointer",
          display: "inline-block",
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


