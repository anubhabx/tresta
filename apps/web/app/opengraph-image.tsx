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
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 18,
              background: "#101720",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 14,
                top: 16,
                width: 18,
                height: 8,
                borderRadius: 4,
                background: "#ffffff",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 14,
                top: 26,
                width: 8,
                height: 16,
                borderRadius: 4,
                background: "#ffffff",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 38,
                top: 16,
                width: 18,
                height: 8,
                borderRadius: 4,
                background: "#ffffff",
                opacity: 0.3,
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 38,
                top: 26,
                width: 8,
                height: 16,
                borderRadius: 4,
                background: "#ffffff",
                opacity: 0.3,
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 49,
                top: 49,
                width: 12,
                height: 12,
                borderRadius: 999,
                background: "#4A3BFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 999,
                  background: "#ffffff",
                }}
              />
            </div>
          </div>
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
