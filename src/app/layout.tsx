import type { Metadata, Viewport } from "next";
import { Fraunces, JetBrains_Mono, Geist } from "next/font/google";
import "./globals.css";

const serif = Fraunces({
  variable: "--font-serif",
  subsets: ["latin"],
  axes: ["opsz", "SOFT", "WONK"],
  style: ["normal", "italic"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const sans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#0a0b0d",
};

const description =
  "mnestic is an independently maintained fork of CozoDB — a transactional relational-graph-vector database that speaks Datalog, tuned as a substrate for agentic memory. Embedded, performant, and built for machine recall.";

export const metadata: Metadata = {
  title: {
    default: "mnestic — a relational-graph-vector engine for machine memory",
    template: "%s · mnestic",
  },
  description,
  keywords: [
    "mnestic",
    "CozoDB",
    "Datalog",
    "graph database",
    "vector database",
    "embedded database",
    "HNSW",
    "hybrid retrieval",
    "agentic memory",
    "RocksDB",
    "Rust",
    "knowledge graph",
  ],
  metadataBase: new URL("https://mnesticdb.com"),
  alternates: { canonical: "/" },
  openGraph: {
    title: "mnestic — a relational-graph-vector engine for machine memory",
    description,
    siteName: "mnestic",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "mnestic",
    description,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${serif.variable} ${mono.variable} ${sans.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
