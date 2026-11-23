import { SERVICES } from "@/content/services";
import { ServicePage } from "@/components/sections/ServicePage";
import { CommercialListings } from "@/components/commercial/CommercialListings";
import { pageMeta } from "@/lib/seo";

const data = SERVICES.commercialProps;

export const metadata = pageMeta({ title: data.meta.title, description: data.meta.description, path: data.path, image: data.hero.image });

/** Live Buildout listings sit right under the hero (they appear automatically once Buildout has website listings). */
export default function Page() {
  return <ServicePage data={data} top={<CommercialListings />} />;
}
