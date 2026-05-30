import type { NextConfig } from "next";
import createMDX from "@next/mdx";

// Turbopack requires MDX plugins to be referenced by string name with
// serializable options (not imported function references).
const prettyCodeOptions = {
  theme: "github-dark-default",
  // Keep shiki's own background off; our panels supply it.
  keepBackground: false,
  defaultLang: { block: "text", inline: "text" },
};

const nextConfig: NextConfig = {
  // Pin the workspace root — the parent dir holds unrelated lockfiles.
  turbopack: { root: import.meta.dirname },
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "style-src 'self' 'unsafe-inline'",
              "script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com",
              "connect-src 'self' https://va.vercel-scripts.com",
              "img-src 'self' data:",
              "font-src 'self'",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

const withMDX = createMDX({
  options: {
    remarkPlugins: [["remark-gfm"]],
    rehypePlugins: [
      // pretty-code tokenizes fenced blocks; slug then gives headings ids.
      ["rehype-pretty-code", prettyCodeOptions],
      ["rehype-slug"],
    ],
  },
});

export default withMDX(nextConfig);
