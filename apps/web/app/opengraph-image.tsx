import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Tresta - Collect & Showcase Social Proof";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          background: "radial-gradient(circle at 82% 18%, #4a3bff33 0%, #09090b 40%), linear-gradient(135deg, #09090b 0%, #18181b 50%, #09090b 100%)",
          color: "#fafafa",
          fontFamily: "Inter, sans-serif",
          padding: "60px 80px",
        }}
      >
        {/* Logo / Brand */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "32px",
          }}
        >
          <svg
            width="72"
            height="72"
            viewBox="0 0 72 72"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="72" height="72" rx="18" fill="#101720" />
            <rect x="14" y="16" width="18" height="8" rx="4" fill="white" />
            <rect x="14" y="26" width="8" height="16" rx="4" fill="white" />
            <rect
              x="38"
              y="16"
              width="18"
              height="8"
              rx="4"
              fill="white"
              opacity="0.3"
            />
            <rect
              x="38"
              y="26"
              width="8"
              height="16"
              rx="4"
              fill="white"
              opacity="0.3"
            />
            <circle cx="55" cy="55" r="6" fill="#4A3BFF" />
            <circle cx="55" cy="55" r="3" fill="white" />
          </svg>
          <span style={{ fontSize: 48, fontWeight: 800, letterSpacing: "-0.02em" }}>
            Tresta
          </span>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 32,
            fontWeight: 600,
            textAlign: "center",
            lineHeight: 1.3,
            maxWidth: 800,
            marginBottom: "24px",
          }}
        >
          Collect &amp; Showcase Social Proof
        </div>

        {/* Description */}
        <div
          style={{
            fontSize: 20,
            color: "#a1a1aa",
            textAlign: "center",
            lineHeight: 1.5,
            maxWidth: 700,
          }}
        >
          The all-in-one platform to collect, manage, and showcase authentic customer
          testimonials. Turn customer love into growth.
        </div>

        {/* URL badge */}
        <div
          style={{
            display: "flex",
            marginTop: "40px",
            padding: "10px 24px",
            borderRadius: 9999,
            border: "1px solid #27272a",
            background: "#18181b",
            fontSize: 16,
            color: "#71717a",
          }}
        >
          www.tresta.app
        </div>
      </div>
    ),
    { ...size },
  );
}
