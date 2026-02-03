import { requireForwarderAccess } from "@/lib/auth-utils";
import { PageLayout, PageHeaderWithBorder, PageContainer } from "@/components/ui/page-layout";

export default async function ReportsPage() {
  await requireForwarderAccess();

  return (
    <PageLayout>
      <PageHeaderWithBorder>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Statistiken</h1>
          <p className="text-sm text-muted-foreground">
            Übersicht über Ihre Statistiken und Berichte.
          </p>
        </div>
      </PageHeaderWithBorder>
      <PageContainer className="pt-6 pb-8">
        <p>Dies ist der Inhalt der Berichte Seite.</p>
      </PageContainer>
    </PageLayout>
  )
} 