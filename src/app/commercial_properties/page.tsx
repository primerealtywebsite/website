import { SERVICES } from "@/content/services";
import { ServicePage } from "@/components/sections/ServicePage";
import { Heading, Section } from "@/components/sections/Blocks";
import { BuildoutListings } from "@/components/commercial/BuildoutListings";
import { pageMeta } from "@/lib/seo";

const data = SERVICES.commercialProps;
const BUILDOUT_TOKEN = process.env.NEXT_PUBLIC_BUILDOUT_TOKEN || "";

export const metadata = pageMeta({ title: data.meta.title, description: data.meta.description, path: data.path, image: data.hero.image });

export default function Page() {
  return (
    <>
      <ServicePage data={data} />
      {BUILDOUT_TOKEN && (
        <Section tone="white" id="listings">
          <Heading eyebrow="Available now" title="Prime 1 commercial listings" intro="Search current office, retail, industrial, land and investment listings. Inquiries go straight to the listing broker." />
          <div className="mt-8">
            <BuildoutListings token={BUILDOUT_TOKEN} />
          </div>
        </Section>
      )}
    </>
  );
}
