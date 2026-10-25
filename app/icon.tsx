import { ImageResponse } from "next/og";
import fs from "node:fs";
import path from "node:path";

export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

export default function Icon() {
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
          borderRadius: 6,
          padding: 2,
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
