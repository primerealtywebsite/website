import Link from "next/link";
import { breadcrumbSchema } from "@/lib/schema";
import { JsonLd } from "./JsonLd";

export type Crumb = { label: string; href: string };

export function Breadcrumbs({ items, tone = "light" }: { items: Crumb[]; tone?: "light" | "dark" }) {
  const all = [{ label: "Home", href: "/" }, ...items];
  return (
    <>
      <nav aria-label="Breadcrumb" className={tone === "dark" ? "text-white/70" : "text-muted"}>
        <ol className="flex flex-wrap items-center gap-1.5 text-[0.8rem]">
          {all.map((c, i) => (
            <li key={c.href} className="flex items-center gap-1.5">
              {i > 0 && <span aria-hidden>/</span>}
              {i === all.length - 1 ? (
                <span aria-current="page" className={tone === "dark" ? "text-white" : "text-ink"}>{c.label}</span>
              ) : (
                <Link href={c.href} className="hover:underline">{c.label}</Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <JsonLd data={breadcrumbSchema(all)} />
    </>
  );
}
