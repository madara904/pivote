import {
  pgTable,
  text,
  timestamp,
  boolean,
  decimal,
  pgEnum,
  integer,
  unique,
} from "drizzle-orm/pg-core";
import { randomUUID } from "crypto";
import { relations } from "drizzle-orm";

export const memberRoleEnum = pgEnum("member_role", [
  "owner",
  "admin",
  "member",
]);
export const organizationTypeEnum = pgEnum("organization_type", [
  "shipper",
  "forwarder",
]);
export const invitationStatusEnum = pgEnum("invitation_status", [
  "pending",
  "accepted",
  "rejected",
  "expired",
]);
export const inquiryStatusEnum = pgEnum("inquiry_status", [
  "draft",
  "sent",
  "closed",
  "cancelled",
]);
export const quotationStatusEnum = pgEnum("quotation_status", [
  "pending",
  "submitted",
  "accepted",
  "rejected",
  "expired",
]);
export const serviceTypeEnum = pgEnum("service_type", [
  "air_freight",
  "sea_freight",
  "road_freight",
  "rail_freight",
]);
export const cargoTypeEnum = pgEnum("cargo_type", [
  "general",
  "dangerous",
  "perishable",
  "fragile",
  "oversized",
]);
export const chargeTypeEnum = pgEnum("charge_type", [
  "freight",
  "local_origin",
  "local_destination",
  "fuel_surcharge",
  "security_fee",
  "handling",
  "customs",
  "insurance",
  "other",
]);

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified")
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").$defaultFn(() => new Date()),
  updatedAt: timestamp("updated_at").$defaultFn(() => new Date()),
});

export const organization = pgTable("organization", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  type: organizationTypeEnum("type").notNull().default("shipper"),
  email: text("email").notNull(),
  phone: text("phone"),
  website: text("website"),
  address: text("address"),
  city: text("city"),
  postalCode: text("postal_code"),
  country: text("country"),
  vatNumber: text("vat_number").unique(),
  registrationNumber: text("registration_number"),
  logo: text("logo"),
  settings: text("settings"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

export const organizationMember = pgTable(
  "organization_member",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: memberRoleEnum("role").notNull().default("member"),
    jobTitle: text("job_title"),
    department: text("department"),
    permissions: text("permissions"),
    isActive: boolean("is_active").default(true),
    joinedAt: timestamp("joined_at")
      .$defaultFn(() => new Date())
      .notNull(),
    createdAt: timestamp("created_at")
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestamp("updated_at")
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => ({
    userOrganizationUnique: unique().on(table.userId),
  })
);

export const organizationInvitation = pgTable(
  "organization_invitation",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    invitedUserId: text("invited_user_id").references(() => user.id, {
      onDelete: "cascade",
    }),
    role: memberRoleEnum("role").notNull().default("member"),
    jobTitle: text("job_title"),
    department: text("department"),
    permissions: text("permissions"),
    status: invitationStatusEnum("status").notNull().default("pending"),
    token: text("token").notNull().unique(),
    inviteMessage: text("invite_message"),
    invitedById: text("invited_by_id")
      .notNull()
      .references(() => user.id),
    expiresAt: timestamp("expires_at").notNull(),
    acceptedAt: timestamp("accepted_at"),
    rejectedAt: timestamp("rejected_at"),
    createdAt: timestamp("created_at")
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestamp("updated_at")
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => ({
    emailOrganizationUnique: unique().on(table.email, table.organizationId),
  })
);

export const inquiry = pgTable("inquiry", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  referenceNumber: text("reference_number").notNull().unique(),
  title: text("title").notNull(),
  description: text("description"),
  serviceType: serviceTypeEnum("service_type").notNull().default("air_freight"),
  originAirport: text("origin_airport").notNull(),
  originCity: text("origin_city").notNull(),
  originCountry: text("origin_country").notNull(),
  destinationAirport: text("destination_airport").notNull(),
  destinationCity: text("destination_city").notNull(),
  destinationCountry: text("destination_country").notNull(),
  cargoType: cargoTypeEnum("cargo_type").notNull().default("general"),
  cargoDescription: text("cargo_description"),
  pieces: integer("pieces").notNull(),
  grossWeight: decimal("gross_weight", { precision: 10, scale: 2 }).notNull(),
  chargeableWeight: decimal("chargeable_weight", { precision: 10, scale: 2 }),
  dimensions: text("dimensions"),
  readyDate: timestamp("ready_date").notNull(),
  deliveryDate: timestamp("delivery_date"),
  temperature: text("temperature"),
  specialHandling: text("special_handling"),
  insuranceRequired: boolean("insurance_required").default(false),
  customsClearance: boolean("customs_clearance").default(false),
  status: inquiryStatusEnum("status").notNull().default("draft"),
  shipperOrganizationId: text("shipper_organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  createdById: text("created_by_id")
    .notNull()
    .references(() => user.id),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

export const inquiryForwarder = pgTable("inquiry_forwarder", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  inquiryId: text("inquiry_id")
    .notNull()
    .references(() => inquiry.id, { onDelete: "cascade" }),
  forwarderOrganizationId: text("forwarder_organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  sentAt: timestamp("sent_at")
    .$defaultFn(() => new Date())
    .notNull(),
  viewedAt: timestamp("viewed_at"),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

export const quotation = pgTable("quotation", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  quotationNumber: text("quotation_number").notNull().unique(),
  inquiryId: text("inquiry_id")
    .notNull()
    .references(() => inquiry.id, { onDelete: "cascade" }),
  forwarderOrganizationId: text("forwarder_organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  totalPrice: decimal("total_price", { precision: 12, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("EUR"),
  airlineCode: text("airline_code"),
  flightNumber: text("flight_number"),
  transitTime: integer("transit_time"),
  validUntil: timestamp("valid_until").notNull(),
  paymentTerms: text("payment_terms"),
  incoterms: text("incoterms"),
  notes: text("notes"),
  terms: text("terms"),
  status: quotationStatusEnum("status").notNull().default("pending"),
  submittedAt: timestamp("submitted_at")
    .$defaultFn(() => new Date())
    .notNull(),
  respondedAt: timestamp("responded_at"),
  createdById: text("created_by_id")
    .notNull()
    .references(() => user.id),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

export const quotationCharge = pgTable("quotation_charge", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  quotationId: text("quotation_id")
    .notNull()
    .references(() => quotation.id, { onDelete: "cascade" }),
  chargeType: chargeTypeEnum("charge_type").notNull(),
  chargeName: text("charge_name").notNull(),
  chargeCode: text("charge_code"),
  unitPrice: decimal("unit_price", { precision: 12, scale: 4 }),
  quantity: decimal("quantity", { precision: 10, scale: 2 }),
  unit: text("unit"),
  totalAmount: decimal("total_amount", { precision: 12, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("EUR"),
  location: text("location"),
  description: text("description"),
  isOptional: boolean("is_optional").default(false),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

export const chargeTemplate = pgTable("charge_template", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  organizationId: text("organization_id").references(() => organization.id, {
    onDelete: "cascade",
  }),
  chargeName: text("charge_name").notNull(),
  chargeCode: text("charge_code").notNull(),
  chargeType: chargeTypeEnum("charge_type").notNull(),
  defaultUnitPrice: decimal("default_unit_price", { precision: 12, scale: 4 }),
  defaultUnit: text("default_unit"),
  defaultCurrency: text("default_currency").default("EUR"),
  serviceType: serviceTypeEnum("service_type").notNull().default("air_freight"),
  location: text("location"),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

export const organizationMemberRelations = relations(organizationMember, ({ one }) => ({
  organization: one(organization, {
    fields: [organizationMember.organizationId],
    references: [organization.id],
  }),
}));

export const organizationRelations = relations(organization, ({ many }) => ({
  members: many(organizationMember),
}));

export type InsertUser = typeof user.$inferInsert;
export type SelectUser = typeof user.$inferSelect;
export type InsertOrganization = typeof organization.$inferInsert;
export type SelectOrganization = typeof organization.$inferSelect;
export type InsertOrganizationMember = typeof organizationMember.$inferInsert;
export type SelectOrganizationMember = typeof organizationMember.$inferSelect;
export type InsertOrganizationInvitation =
  typeof organizationInvitation.$inferInsert;
export type SelectOrganizationInvitation =
  typeof organizationInvitation.$inferSelect;
export type InsertInquiry = typeof inquiry.$inferInsert;
export type SelectInquiry = typeof inquiry.$inferSelect;
export type InsertInquiryForwarder = typeof inquiryForwarder.$inferInsert;
export type SelectInquiryForwarder = typeof inquiryForwarder.$inferSelect;
export type InsertQuotation = typeof quotation.$inferInsert;
export type SelectQuotation = typeof quotation.$inferSelect;
export type InsertQuotationCharge = typeof quotationCharge.$inferInsert;
export type SelectQuotationCharge = typeof quotationCharge.$inferSelect;
export type InsertChargeTemplate = typeof chargeTemplate.$inferInsert;
export type SelectChargeTemplate = typeof chargeTemplate.$inferSelect;
