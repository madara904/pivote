import { z } from "zod"

export const organizationTypeSchema = z.enum(["shipper", "forwarder"], {
  required_error: "Bitte wählen Sie einen Unternehmenstyp aus.",
})

export const organizationDetailsSchema = z.object({
  organizationType: organizationTypeSchema,
  name: z
    .string()
    .min(2, { message: "Der Unternehmensname muss mindestens 2 Zeichen lang sein." })
    .max(100, { message: "Der Unternehmensname darf maximal 100 Zeichen lang sein." })
    .trim(),

  // Adressfelder
  address: z
    .string()
    .min(5, { message: "Bitte geben Sie eine vollständige Adresse an." })
    .max(500, { message: "Die Adresse darf maximal 500 Zeichen lang sein." })
    .trim(),
  city: z
    .string()
    .min(2, { message: "Die Stadt muss mindestens 2 Zeichen lang sein." })
    .max(100, { message: "Die Stadt darf maximal 100 Zeichen lang sein." })
    .trim(),
  postalCode: z
    .string()
    .min(3, { message: "Bitte geben Sie eine gültige Postleitzahl an." })
    .max(20, { message: "Die Postleitzahl darf maximal 20 Zeichen lang sein." })
    .trim(),
  country: z
    .string()
    .min(2, { message: "Bitte wählen Sie ein Land aus." })
    .max(100, { message: "Das Land darf maximal 100 Zeichen lang sein." })
    .trim(),

  // Kontaktdaten
  phone: z
    .string()
    .min(10, { message: "Bitte geben Sie eine gültige Telefonnummer an." })
    .max(20, { message: "Die Telefonnummer darf maximal 20 Zeichen lang sein." })
    .trim(),
  website: z.string().url({ message: "Bitte geben Sie eine gültige Website-URL an." }).optional().or(z.literal("")),
  taxNumber: z.string().max(50, { message: "Die Steuernummer darf maximal 50 Zeichen lang sein." }).optional(),

  // Unternehmensspezifisch
  industry: z.string().max(50, { message: "Die Branche darf maximal 50 Zeichen lang sein." }).optional(),

  // Spediteur-spezifisch
  services: z.array(z.string()).optional(),
  certifications: z.array(z.string()).optional(),
  coverageAreas: z.array(z.string()).optional(),
})

// Type for organization metadata stored in Better Auth
export const organizationMetadataSchema = z.object({
  organizationType: organizationTypeSchema,
  address: z.string(),
  city: z.string(),
  postalCode: z.string(),
  country: z.string(),
  phone: z.string(),
  website: z.string().optional(),
  taxNumber: z.string().optional(),
  industry: z.string().optional(),
  // Forwarder specific fields
  services: z.array(z.string()).optional(),
  certifications: z.array(z.string()).optional(),
  coverageAreas: z.array(z.string()).optional(),
})

export type OrganizationDetails = z.infer<typeof organizationDetailsSchema>
export type OrganizationMetadata = z.infer<typeof organizationMetadataSchema>
export type OrganizationType = z.infer<typeof organizationTypeSchema>

// Type for Better Auth organization with metadata
type BetterAuthOrganization = {
  id: string
  name: string
  slug: string
  logo?: string | null
  metadata?: Record<string, unknown>
  createdAt: Date
  members: Array<{
    id: string
    createdAt: Date
    userId: string
    organizationId: string
    role: string
    teamId?: string
    user: {
      id: string
      name: string
      email: string
      image: string | undefined
    }
  }>
  invitations: Array<{
    id: string
    email: string
    status: "pending" | "accepted" | "rejected" | "canceled"
    expiresAt: Date
    organizationId: string
    role: string
    inviterId: string
    teamId?: string
  }>
}

// Helper function to safely extract and validate organization metadata
export function extractOrganizationMetadata(
  organization: BetterAuthOrganization | null | undefined
): OrganizationMetadata | null {
  if (!organization?.metadata) {
    return null
  }

  try {
    // Handle case where metadata might be stored as a JSON string
    let metadataObj: unknown
    
    if (typeof organization.metadata === 'string') {
      metadataObj = JSON.parse(organization.metadata)
    } else {
      metadataObj = organization.metadata
    }

    // Validate with Zod schema
    const result = organizationMetadataSchema.safeParse(metadataObj)
    
    if (result.success) {
      return result.data
    } else {
      console.error('Invalid organization metadata:', result.error)
      return null
    }
  } catch (error) {
    console.error('Error parsing organization metadata:', error)
    return null
  }
}

// Helper function to get organization type from metadata
export function getOrganizationType(organization: BetterAuthOrganization | null | undefined): "shipper" | "forwarder" | null {
  const metadata = extractOrganizationMetadata(organization)
  return metadata?.organizationType || null
}

// Helper function to check if organization is a forwarder
export function isForwarder(organization: BetterAuthOrganization | null | undefined): boolean {
  return getOrganizationType(organization) === "forwarder"
}

// Helper function to check if organization is a shipper
export function isShipper(organization: BetterAuthOrganization | null | undefined): boolean {
  return getOrganizationType(organization) === "shipper"
}

// Minimal type for API org member user (may be missing id)
type RawOrgMemberUser = {
  id?: string;
  name?: string;
  email?: string;
  image?: string;
};

// Minimal type for API org member
type RawOrgMember = {
  id: string;
  createdAt: Date;
  userId: string;
  organizationId: string;
  role: string;
  teamId?: string;
  user: RawOrgMemberUser;
};

// Minimal type for API org
type RawOrg = Omit<BetterAuthOrganization, 'members'> & { members: RawOrgMember[] };

// Accepts raw org shape (from API), returns fully patched BetterAuthOrganization
export function patchOrganizationMembers(org: RawOrg): BetterAuthOrganization {
  return {
    ...org,
    members: org.members.map((m) => ({
      ...m,
      user: {
        id: m.user?.id ?? m.userId ?? "",
        name: m.user?.name ?? "",
        email: m.user?.email ?? "",
        image: m.user?.image ?? "",
      },
    })),
  };
}
