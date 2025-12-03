"use client";

import { useEffect, useState } from "react";

const TEAM_MEMBERS = [
  "laure",
  "teammate1",
  "teammate2",
  // add more if needed!
];

export default function ABTestPage() {
  const [variant, setVariant] = useState<string | null>(null);

  useEffect(() => {
    const storageKey = "abtest-variant";

    // Check if variant already assigned
    const existing = window.localStorage.getItem(storageKey);
    if (existing === "A" || existing === "B") {
      setVariant(existing);
      return;
    }

    // New visitor → random 50/50
    const randomVariant = Math.random() < 0.5 ? "A" : "B";
    window.localStorage.setItem(storageKey, randomVariant);
    setVariant(randomVariant);
  }, []);

  if (!variant) return <p>Loading A/B test…</p>;

  const label = variant === "A" ? "kudos" : "thanks";

  return (
    <main style={{ padding: 32 }}>
      <h1>A/B Test Page</h1>

      <h2>Team Member Nicknames</h2>
      <ul>
        {TEAM_MEMBERS.map((name) => (
          <li key={name}>{name}</li>
        ))}
      </ul>

      <button
        id="abtest"
        style={{
          padding: "12px 24px",
          fontSize: "1rem",
          marginTop: "24px",
        }}
      >
        {label}
      </button>

      <p style={{ marginTop: "16px" }}>
        You are seeing variant: <strong>{variant}</strong>
      </p>
    </main>
  );
}
