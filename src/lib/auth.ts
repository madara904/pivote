import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { env } from "./env";
import { organization } from "better-auth/plugins";
import { getUserActiveOrganization } from "./organization-utils";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  account: {
    accountLinking: {
      enabled: true,
    },
  },
  socialProviders: {
    github: {
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
    },
  },
  plugins: [
    organization({
      allowUserToCreateOrganization: true,
      organizationLimit: 1,
      creatorRole: "owner",
      membershipLimit: 5,
      invitationExpiresIn: 48 * 60 * 60,
      cancelPendingInvitationsOnReInvite: true,
      invitationLimit: 5,
    }),
  ],
  databaseHooks: {
    session: {
      create: {
        before: async (session) => {
          const org = await getUserActiveOrganization(session.userId);
          return {
            data: {
              ...session,
              activeOrganizationId: org?.id || null,
            },
          };
        },
      },
    },
  },
});
