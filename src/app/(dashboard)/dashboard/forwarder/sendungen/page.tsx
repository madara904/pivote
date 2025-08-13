import { requireForwarderAccess } from "@/lib/auth-utils";

export default async function SendungenPage() {
  await requireForwarderAccess();

  return (
    <div>
      <h1>Sendungen Seite</h1>
      <p>Dies ist der Inhalt der Sendungen Seite.</p>
    </div>
  )
} 