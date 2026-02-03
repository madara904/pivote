import { requireForwarderAccess } from "@/lib/auth-utils";
import ForwarderConnectionsView from "./verbindungen-view";
import { PageLayout, PageHeaderWithBorder, PageContainer } from "@/components/ui/page-layout";

export default async function VerbindungenPage() {
  await requireForwarderAccess();

  return (
    <PageLayout>
      <PageHeaderWithBorder>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Versenderverbindungen
          </h1>
          <p className="text-sm text-muted-foreground">
            Verwalten Sie Ihre Versenderverbindungen und Einladungen.
          </p>
        </div>
      </PageHeaderWithBorder>
      <PageContainer className="pt-6 pb-8">
        <ForwarderConnectionsView />
      </PageContainer>
    </PageLayout>
  );
}
