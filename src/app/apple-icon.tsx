import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

const markSvg = `<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 32 32'><g stroke='%236fb3c4' stroke-opacity='0.6' stroke-width='1.6'><line x1='8' y1='23' x2='23' y2='9'/><line x1='23' y1='9' x2='24' y2='23'/><line x1='8' y1='23' x2='24' y2='23'/></g><circle cx='23' cy='9' r='2.8' fill='%236fb3c4'/><circle cx='24' cy='23' r='2.4' fill='%236fb3c4'/><circle cx='8' cy='23' r='4.2' fill='%23c8f24a'/></svg>`;

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0a0b0d",
        }}
      >
        <img width={120} height={120} src={`data:image/svg+xml,${markSvg}`} alt="" />
      </div>
    ),
    { ...size },
  );
}
