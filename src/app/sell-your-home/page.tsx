import { SERVICES } from "@/content/services";
import { ServicePage } from "@/components/sections/ServicePage";
import { Heading, Section } from "@/components/sections/Blocks";
import { NetProceedsCalculator } from "@/components/sections/NetProceedsCalculator";
import { pageMeta } from "@/lib/seo";

const data = SERVICES.sell;

export const metadata = pageMeta({ title: data.meta.title, description: data.meta.description, path: data.path, image: data.hero.image });

export default function Page() {
  return (
    <ServicePage data={data}>
      <Section tone="paper" id="net-proceeds">
        <Heading eyebrow="Seller net proceeds" title="What would you walk away with?" intro="Estimate your proceeds after the mortgage payoff, commission, Florida documentary stamp tax and closing costs." />
        <div className="mt-8">
          <NetProceedsCalculator />
        </div>
      </Section>
    </ServicePage>
  );
}
