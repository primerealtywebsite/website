import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Suspense } from "react";
import "./globals.css";
import { site } from "@/config/site";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileBar } from "@/components/layout/MobileBar";
import { ContactDialog } from "@/components/layout/ContactDialog";
import { MetaPixel } from "@/components/analytics/MetaPixel";
import { GoogleTag } from "@/components/analytics/GoogleTag";
import { JsonLd } from "@/components/sections/JsonLd";
import { organizationSchema } from "@/lib/schema";

// Self-hosted (Latin subset) for speed and reliable builds. DM Serif Display + Public Sans, SIL Open Font License.
const serif = localFont({ src: "../fonts/dm-serif-display-400.woff2", weight: "400", variable: "--font-serif", display: "swap", fallback: ["Georgia", "serif"] });
const sans = localFont({ src: "../fonts/public-sans-variable.woff2", weight: "100 900", variable: "--font-body", display: "swap", fallback: ["system-ui", "Arial", "sans-serif"] });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: "Tampa Bay Real Estate Brokerage & Property Management | Prime 1 Realty", template: "%s | Prime 1 Realty" },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.name, url: site.url }],
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#121316",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-US" className={`${serif.variable} ${sans.variable}`}>
      <body className="min-h-dvh antialiased">
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <Suspense fallback={null}>
          <MobileBar />
        </Suspense>
        <ContactDialog />
        <MetaPixel />
        <GoogleTag />
        <JsonLd data={organizationSchema()} />
      </body>
    </html>
  );
}
