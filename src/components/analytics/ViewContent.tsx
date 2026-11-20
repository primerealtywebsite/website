"use client";

import { useEffect } from "react";
import { track } from "@/lib/meta";

/** Fires ViewContent once when a service or area page is viewed. */
export function ViewContent({ category, name }: { category: string; name: string }) {
  useEffect(() => {
    track("ViewContent", { content_category: category, content_name: name });
  }, [category, name]);
  return null;
}
