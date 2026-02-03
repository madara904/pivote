import { requireShipperAccess } from "@/lib/auth-utils";
import OrganizationCreateForm from "../../../forwarder/components/organization-create-form";
import { PageContainer } from "@/components/ui/page-layout";

export default async function OrganizationSettingsPage() {
  await requireShipperAccess();

  return (
    <PageContainer>
      <OrganizationCreateForm />
    </PageContainer>
  );
}
