"use client";

import { useEffect, useState } from "react";

/**
 * Buildout's own listing viewer, shown when a visitor opens a listing (?propertyId=…). Its inquiry
 * form creates the lead directly in Buildout CRM and triggers Buildout's "New website leads" alerts.
 */
export function BuildoutListings({ token }: { token: string }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!new URLSearchParams(window.location.search).get("propertyId")) return;
    setOpen(true); // eslint-disable-line react-hooks/set-state-in-effect
    (window as unknown as { buildoutConfig: unknown }).buildoutConfig = { token, plugin: "inventory", target: "buildout" };
    const s = document.createElement("script");
    s.src = "https://buildout.com/api.js?v8";
    s.async = true;
    document.body.appendChild(s);
    document.getElementById("listings")?.scrollIntoView();
    return () => {
      s.remove();
    };
  }, [token]);
  if (!open) return null;
  return <div id="buildout" className="mb-10 min-h-[600px]" />;
}
