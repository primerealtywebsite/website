import { Breadcrumbs } from "./Breadcrumbs";

export function LegalPage({ title, path, effective, children }: { title: string; path: string; effective: string; children: React.ReactNode }) {
  return (
    <section className="bg-paper py-10 md:py-14">
      <div className="container-x max-w-3xl">
        <Breadcrumbs items={[{ label: title, href: path }]} />
        <h1 className="mt-5 text-[2.3rem] leading-tight md:text-5xl">{title}</h1>
        <p className="mt-3 text-sm text-muted">Effective {effective}</p>
        <div className="prose-p1 mt-8">{children}</div>
      </div>
    </section>
  );
}
