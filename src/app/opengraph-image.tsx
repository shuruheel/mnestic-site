import { ImageResponse } from "next/og";

export const alt =
  "mnestic — a relational-graph-vector engine for machine memory";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const markSvg = `<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 32 32'><g stroke='%236fb3c4' stroke-opacity='0.6' stroke-width='1.6'><line x1='8' y1='23' x2='23' y2='9'/><line x1='23' y1='9' x2='24' y2='23'/><line x1='8' y1='23' x2='24' y2='23'/></g><circle cx='23' cy='9' r='2.8' fill='%236fb3c4'/><circle cx='24' cy='23' r='2.4' fill='%236fb3c4'/><circle cx='8' cy='23' r='4.2' fill='%23c8f24a'/></svg>`;

export default function Og() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#0a0b0d",
          backgroundImage:
            "radial-gradient(circle at 14% 12%, rgba(200,242,74,0.14), transparent 40%), radial-gradient(circle at 88% 86%, rgba(111,179,196,0.13), transparent 44%)",
          padding: "72px 80px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <img
            width={56}
            height={56}
            src={`data:image/svg+xml,${markSvg}`}
            alt=""
          />
          <div
            style={{
              fontSize: 36,
              fontWeight: 600,
              color: "#ece7dc",
              letterSpacing: "-0.02em",
            }}
          >
            mnestic
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 76,
              fontWeight: 600,
              lineHeight: 1.04,
              color: "#ece7dc",
              letterSpacing: "-0.03em",
            }}
          >
            embedded Datalog.
          </div>
          <div
            style={{
              fontSize: 76,
              fontWeight: 600,
              lineHeight: 1.04,
              color: "#ece7dc",
              letterSpacing: "-0.03em",
            }}
          >
            performant graphs.
          </div>
          <div
            style={{
              fontSize: 76,
              fontWeight: 600,
              lineHeight: 1.04,
              letterSpacing: "-0.03em",
              color: "#c8f24a",
              fontStyle: "italic",
            }}
          >
            a substrate for machine memory.
          </div>
        </div>

        <div
          style={{
            fontSize: 26,
            color: "#6f6e69",
            fontFamily: "monospace",
            display: "flex",
          }}
        >
          a maintained fork of CozoDB · relational · graph · vector · MPL-2.0
        </div>
      </div>
    ),
    { ...size },
  );
}
