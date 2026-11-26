import Link from "next/link";

export default function NotFound() {
  return (
    <section className="bg-paper py-20">
      <div className="container-x max-w-2xl text-center">
        <p className="eyebrow justify-center">404</p>
        <h1 className="mt-3 text-4xl md:text-5xl">Page not found</h1>
        <p className="mt-4 text-lg text-muted">This page moved or no longer exists. Here are the most useful places to go next.</p>
        <ul className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2 font-semibold">
          {[
            ["Search homes", "/home-search"],
            ["Sell your home", "/sell-your-home"],
            ["Association management", "/property_management"],
            ["Commercial", "/commercial"],
            ["Join Prime 1", "/join"],
            ["Contact", "/lets-connect"],
          ].map(([l, h]) => (
            <li key={h}><Link href={h} className="text-red underline-offset-4 hover:underline">{l}</Link></li>
          ))}
        </ul>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/get-started" className="btn btn-red">Get started</Link>
          <Link href="/" className="btn btn-ghost">Go home</Link>
        </div>
      </div>
    </section>
  );
}
