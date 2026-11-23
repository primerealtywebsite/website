"use client";

import { useEffect } from "react";

/**
 * Buildout Inventory plugin: Prime 1's live commercial listings, searchable, with Buildout's own
 * inquiry forms. Every inquiry lands in Buildout CRM as a website lead and triggers Buildout's
 * "New website leads" email/SMS notifications. Enabled by NEXT_PUBLIC_BUILDOUT_TOKEN (Buildout >
 * Settings > Plugins > Installation Instructions). Leave it unset while the account only has demo listings.
 */
export function BuildoutListings({ token }: { token: string }) {
  useEffect(() => {
    (window as unknown as { buildoutConfig: unknown }).buildoutConfig = { token, plugin: "inventory", target: "buildout" };
    const s = document.createElement("script");
    s.src = "https://buildout.com/api.js?v8";
    s.async = true;
    document.body.appendChild(s);
    return () => {
      s.remove();
    };
  }, [token]);
  return <div id="buildout" className="min-h-[480px]" />;
}
