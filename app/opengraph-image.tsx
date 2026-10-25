import { ImageResponse } from "next/og";
import fs from "node:fs";
import path from "node:path";

export const alt = "trcodes — Tangkas Risdianto | Full Stack Developer";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const logoBuffer = fs.readFileSync(
    path.join(process.cwd(), "public", "imglogo.png")
  );
  const logoDataUrl = `data:image/png;base64,${logoBuffer.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "space-between",
          backgroundColor: "#0d1117",
          backgroundImage:
            "radial-gradient(circle at 25px 25px, #1f2937 2%, transparent 0%), radial-gradient(circle at 75px 75px, #111827 2%, transparent 0%)",
          backgroundSize: "100px 100px",
          padding: "70px 80px",
          fontFamily: "sans-serif",
          color: "#f3f4f6",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <div
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "14px",
              backgroundColor: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "6px",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logoDataUrl}
              alt="trcodes logo"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </div>
          <span
            style={{
              fontSize: "30px",
              fontWeight: 700,
              letterSpacing: "-0.5px",
              color: "#e5e7eb",
            }}
          >
            trcodes.dev
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <h1
            style={{
              fontSize: "62px",
              fontWeight: 900,
              lineHeight: 1.1,
              letterSpacing: "-1.5px",
              margin: 0,
              color: "#ffffff",
            }}
          >
            Tangkas Risdianto
          </h1>
          <p
            style={{
              fontSize: "32px",
              fontWeight: 500,
              color: "#9ca3af",
              margin: 0,
              lineHeight: 1.4,
            }}
          >
            Full Stack Developer • Next.js 16 • PostgreSQL • Enterprise Security
          </p>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            borderTop: "1px solid #1f2937",
            paddingTop: "28px",
            fontSize: "22px",
            color: "#6b7280",
          }}
        >
          <span>Ngoding apa saja. Menceritakan perjalanannya.</span>
          <span style={{ color: "#3b82f6" }}>https://trcodes.dev</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
