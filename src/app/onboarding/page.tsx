import ClientOnboarding from "./ClientOnboarding";
import { requireNoOrganization } from "@/lib/auth-utils";

export default async function Page() {
  await requireNoOrganization();
  return <ClientOnboarding />;
}