import Link from "next/link";

export default function NotFound() {
  return (
    <section className="bg-paper py-20">
      <div className="container-x max-w-2xl text-center">
        <p className="eyebrow justify-center">404</p>
        <h1 className="mt-3 text-4xl md:text-5xl">This page moved or doesn&apos;t exist</h1>
        <p className="mt-4 text-lg text-muted">Tell us what you need and we&apos;ll point you to the right place.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/get-started" className="btn btn-red">Get started</Link>
          <Link href="/" className="btn btn-ghost">Go home</Link>
        </div>
      </div>
    </section>
  );
}
