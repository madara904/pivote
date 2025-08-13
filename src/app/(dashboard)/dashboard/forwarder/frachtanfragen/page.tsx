import { requireForwarderAccess } from "@/lib/auth-utils";

export default async function FrachtanfragenPage() {
  await requireForwarderAccess();

  return (
    <div>
      <h1>Frachtanfragen Seite</h1>
      <p>Dies ist der Inhalt der Frachtanfragen Seite.</p>
    </div>
  )
} 