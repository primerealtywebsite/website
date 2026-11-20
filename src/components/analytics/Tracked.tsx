"use client";

import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { track, trackCustom, type StandardEvent, type TrackParams } from "@/lib/meta";
import { isExternal } from "@/lib/utils";

type Props = Omit<ComponentProps<"a">, "href"> & {
  href: string;
  event?: StandardEvent;
  custom?: string;
  params?: TrackParams;
  children: ReactNode;
};

/**
 * Every CTA on the site goes through this component so no button is left untracked.
 * Internal links use next/link; tel:, mailto: and external links use a plain <a>.
 */
export function TrackedLink({ href, event, custom, params, onClick, children, ...rest }: Props) {
  const handle: Props["onClick"] = (e) => {
    if (event) track(event, params);
    if (custom) trackCustom(custom, params);
    onClick?.(e);
  };
  const loc = typeof params?.cta_location === "string" ? params.cta_location : undefined;
  if (isExternal(href)) {
    const newTab = /^https?:/.test(href);
    return (
      <a href={href} onClick={handle} data-loc={loc} {...(newTab ? { target: "_blank", rel: "noopener" } : {})} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} onClick={handle} {...rest}>
      {children}
    </Link>
  );
}
