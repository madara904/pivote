import { requireForwarderAccess } from "@/lib/auth-utils";
import OrganizationCreateForm from "../../components/organization-create-form";
import { PageContainer } from "@/components/ui/page-layout";

export default async function OrganizationSettingsPage() {
  await requireForwarderAccess();

  return (
    <PageContainer>
      <OrganizationCreateForm />
    </PageContainer>
  );
}
