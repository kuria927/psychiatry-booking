"use client";

import { useEffect, useState } from "react";

const TEAM_MEMBERS = [
  "Laure",
  "Yiqi",
  "Cindy",
];

export default function ABTestPage() {
  const [variant, setVariant] = useState<string | null>(null);

  useEffect(() => {
    const storageKey = "abtest-variant";

    // Check if already assigned
    const existing = window.localStorage.getItem(storageKey);
    if (existing === "A" || existing === "B") {
      setVariant(existing);
      return;
    }

    // Otherwise assign randomly
    const chosen = Math.random() < 0.5 ? "A" : "B";
    window.localStorage.setItem(storageKey, chosen);
    setVariant(chosen);
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
        textAlign: "left",
      }}
    >
      <h1 style={{ marginBottom: "16px" }}>A/B Test Page</h1>

      <h2 style={{ marginBottom: "8px" }}>Team Member Nicknames</h2>

      <ul style={{ marginBottom: "32px", paddingLeft: "20px" }}>
        {TEAM_MEMBERS.map((name) => (
          <li key={name} style={{ marginBottom: "6px" }}>
            {name}
          </li>
        ))}
      </ul>

      {/* FIXED BUTTON — now visibly styled */}
      <button
        id="abtest"
        style={{
          padding: "12px 28px",
          backgroundColor: "#0070f3",
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

