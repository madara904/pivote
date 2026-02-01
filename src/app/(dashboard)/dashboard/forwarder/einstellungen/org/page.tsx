import { requireForwarderAccess } from "@/lib/auth-utils";
import OrganizationCreateForm from "../../components/organization-create-form";

export default async function OrganizationSettingsPage() {
  await requireForwarderAccess();

  return <OrganizationCreateForm />;
}
