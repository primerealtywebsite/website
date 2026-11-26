import { SERVICES } from "@/content/services";
import { ServicePage } from "@/components/sections/ServicePage";
import { AssociationSections } from "@/components/management/AssociationSections";
import { ProposalForm } from "@/components/management/ProposalForm";
import { pageMeta } from "@/lib/seo";

const data = SERVICES.management;

export const metadata = pageMeta({ title: data.meta.title, description: data.meta.description, path: data.path, image: data.hero.image });

export default function Page() {
  return (
    <ServicePage data={data} form={<ProposalForm />} emergency>
      <AssociationSections />
    </ServicePage>
  );
}
