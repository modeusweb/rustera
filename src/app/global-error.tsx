"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ background: "#0b0d11", color: "#eef1f6", fontFamily: "system-ui, sans-serif", display: "grid", placeItems: "center", minHeight: "100vh", margin: 0 }}>
        <div style={{ textAlign: "center", padding: 24 }}>
          <h1 style={{ fontSize: 20 }}>Something went wrong</h1>
          <p style={{ color: "#9aa3b2", maxWidth: 420, lineHeight: 1.6 }}>
            RUSTERA could not render this page. Please try again.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{ marginTop: 16, padding: "10px 18px", borderRadius: 8, border: 0, background: "#8b7cf6", color: "#fff", cursor: "pointer" }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
