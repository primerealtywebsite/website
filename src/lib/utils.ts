import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function absoluteUrl(path: string, base: string) {
  if (/^https?:\/\//.test(path)) return path;
  return `${base.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}

export function isExternal(href: string) {
  return /^(https?:)?\/\//.test(href) || href.startsWith("tel:") || href.startsWith("mailto:");
}
