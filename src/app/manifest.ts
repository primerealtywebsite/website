import type { MetadataRoute } from "next";

/** Android / Chrome home-screen and search icons. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Prime 1 Realty & Property Management",
    short_name: "Prime 1",
    description: "Tampa Bay real estate brokerage and property & association management.",
    start_url: "/",
    display: "browser",
    background_color: "#121316",
    theme_color: "#121316",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
