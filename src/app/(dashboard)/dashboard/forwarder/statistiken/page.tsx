import { requireForwarderAccess } from "@/lib/auth-utils";

export default async function ReportsPage() {
  await requireForwarderAccess();

  return (
    <div>
      <h1>Berichte Seite</h1>
      <p>Dies ist der Inhalt der Berichte Seite.</p>
    </div>
  )
} 