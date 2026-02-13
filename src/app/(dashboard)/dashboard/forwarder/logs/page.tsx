import { requireForwarderAccess } from "@/lib/auth-utils";
import { PageContainer, PageHeader } from "@/components/ui/page-layout";

export default async function ReportsPage() {
  await requireForwarderAccess();

  return (
    <PageContainer>
      <PageHeader title="Logs & Events" />
      <div className="mt-10">
        <p>Dies ist der Inhalt der Berichte Seite.</p>
      </div>
    </PageContainer>
  );
} 