import { SERVICES } from "@/content/services";
import { ServicePage } from "@/components/sections/ServicePage";
import { pageMeta } from "@/lib/seo";

const data = SERVICES.buy;

export const metadata = pageMeta({ title: data.meta.title, description: data.meta.description, path: data.path, image: data.hero.image });

export default function Page() {
  return <ServicePage data={data} />;
}
