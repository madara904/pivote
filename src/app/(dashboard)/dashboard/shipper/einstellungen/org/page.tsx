import { requireShipperAccess } from "@/lib/auth-utils";
import OrganizationCreateForm from "../../../forwarder/einstellungen/org/organization/organization-create-form";
import { PageContainer } from "@/components/ui/page-layout";
import { prefetch, trpc } from "@/trpc/server";

export default async function OrganizationSettingsPage() {
  await requireShipperAccess();

  void prefetch(trpc.organization.getMyOrganizations.queryOptions());

  return (
    <PageContainer>
      <OrganizationCreateForm />
    </PageContainer>
  );
}
