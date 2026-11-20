"use client";

import { useSyncExternalStore } from "react";

const read = () => {
  try {
    return sessionStorage.getItem("p1-lead-name") ?? "";
  } catch {
    return "";
  }
};

export function FirstName() {
  const name = useSyncExternalStore(() => () => {}, read, () => "");
  return name ? <>, {name.slice(0, 30)}</> : null;
}
