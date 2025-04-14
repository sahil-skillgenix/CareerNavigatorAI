import { AuthenticatedLayout } from "@/components/layouts";
import { OrganizationPathwayForm } from "@/components/organization-pathway/OrganizationPathwayForm";

export default function OrganizationPathwayPage() {
  return (
    <AuthenticatedLayout
      title="Organization Career Pathway"
      subtitle="Analyze your career progression opportunities within your organization"
    >
      <OrganizationPathwayForm />
    </AuthenticatedLayout>
  );
}