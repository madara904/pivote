import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { organizationMember } from "@/db/schema";
import { eq } from "drizzle-orm";
import ClientOnboarding from "./ClientOnboarding";

export default async function Page() {

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) redirect("/sign-in");


  const memberships = await db.query.organizationMember.findMany({
    where: eq(organizationMember.userId, session.user.id),
  });
  if (memberships.length > 0) redirect("/dashboard");


  return <ClientOnboarding />;
}
