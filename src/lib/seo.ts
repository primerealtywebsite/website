import type { Metadata } from "next";
import { site } from "@/config/site";
import { hasAgentVersion, markdownPath } from "@/lib/agent-paths";

export function pageMeta({
  title,
  description,
  path,
  image = "/og/prime1-realty-og.jpg",
  noindex,
  type = "website",
}: {
  title: string;
  description: string;
  path: string;
  image?: string;
  noindex?: boolean;
  type?: "website" | "article";
}): Metadata {
  return {
    title: { absolute: title },
    description,
    // Pages with an AI version also advertise their Markdown copy (Agent Experience layer 3).
    alternates: { canonical: path, ...(hasAgentVersion(path) ? { types: { "text/markdown": markdownPath(path) } } : {}) },
    openGraph: {
      type,
      url: path,
      siteName: site.name,
      title,
      description,
      locale: "en_US",
      images: [image.startsWith("/og/") ? { url: image, width: 1200, height: 630, alt: title } : { url: image, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
    robots: noindex ? { index: false, follow: true } : undefined,
  };
}
