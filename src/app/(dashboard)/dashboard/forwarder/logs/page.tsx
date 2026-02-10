import { requireForwarderAccess } from "@/lib/auth-utils";
import { PageLayout, PageHeaderWithBorder, PageContainer } from "@/components/ui/page-layout";

export default async function ReportsPage() {
  await requireForwarderAccess();

  return (
    <>
        <div className="p-6 sm:p-10">
          <h1 className="text-2xl font-bold tracking-tight">Logs & Events</h1>


        <div className="mt-10">
          <p>Dies ist der Inhalt der Berichte Seite.</p>
        </div>
        </div>
</>
  )
} 