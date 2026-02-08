import { requireShipperAccess } from "@/lib/auth-utils";
import OrganizationCreateForm from "../../../forwarder/einstellungen/organisation/organisation/organization-create-form";
import { PageContainer } from "@/components/ui/page-layout";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { ErrorBoundary } from "@/components/error-boundary";
import { Suspense } from "react";
import Loading from "./loading";

export default async function OrganizationSettingsPage() {
  await requireShipperAccess();

  await prefetch(trpc.organization.getMyOrganizations.queryOptions());

  return (
    <HydrateClient>
      <ErrorBoundary
        title="Fehler beim Laden der Organisationen"
        description="Es ist ein Fehler beim Laden der Organisationen aufgetreten. Bitte versuchen Sie es später erneut oder kontaktieren Sie den Support, wenn das Problem weiterhin besteht."
      >
        <Suspense fallback={<Loading />}>
          <PageContainer>
            <OrganizationCreateForm />
          </PageContainer>
        </Suspense>
      </ErrorBoundary>
    </HydrateClient>
  );
}
