import { ImageResponse } from "next/og";
import fs from "node:fs";
import path from "node:path";

export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

export default function AppleIcon() {
  const logoBuffer = fs.readFileSync(
    path.join(process.cwd(), "public", "imglogo.png")
  );
  const logoDataUrl = `data:image/png;base64,${logoBuffer.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#ffffff",
          borderRadius: 36,
          padding: 20,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoDataUrl}
          alt="trcodes logo"
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
      </div>
    ),
    {
      ...size,
    }
  );
}
