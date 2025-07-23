import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { organizationMember } from "@/db/schema";
import { eq } from "drizzle-orm";
import ClientOnboarding from "./ClientOnboarding";


export default async function Page() {
  // 1. Get session from Better Auth
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) redirect("/sign-in");

  // 2. Check if user is already in an organization
  const memberships = await db.query.organizationMember.findMany({
    where: eq(organizationMember.userId, session.user.id),
  });
  if (memberships.length > 0) redirect("/dashboard");

  // 3. Render onboarding client component
  return <ClientOnboarding />
} 