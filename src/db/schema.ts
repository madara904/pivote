import {
  pgTable,
  text,
  timestamp,
  boolean,
  decimal,
  pgEnum,
  integer,
  unique,
  jsonb,
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
export const connectionStatusEnum = pgEnum("connection_status", [
  "pending",
  "connected",
]);
export const inquiryStatusEnum = pgEnum("inquiry_status", [
  "draft",        // Shipper creating inquiry
  "open",         // Sent to forwarders, open for quotations
  "awarded",      // Shipper accepted a quotation
  "cancelled",    // Inquiry cancelled by shipper
  "expired",      // Inquiry expired by validity date
]);
export const quotationStatusEnum = pgEnum("quotation_status", [
  "draft",        // Forwarder creating quotation
  "submitted",    // Forwarder submitted quotation (angeboten/ausstehend)
  "accepted",     // Shipper accepted quotation
  "rejected",     // Shipper rejected quotation
  "expired",      // Quotation expired by validUntil date
]);

export const forwarderResponseStatusEnum = pgEnum("forwarder_response_status", [
  "pending",    // Forwarder hasn't responded yet
  "rejected",   // Forwarder declined to quote
  "quoted",     // Forwarder submitted a quotation
]);
export const inquiryDocumentTypeEnum = pgEnum("inquiry_document_type", [
  "packing_list",
  "commercial_invoice",
  "certificate_of_origin",
  "awb",
  "other",
]);

export const subscriptionTierEnum = pgEnum("subscription_tier", [
  "basic",
  "medium",
  "advanced",
]);

export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "active",
  "canceled",
  "past_due",
]);
export const serviceTypeEnum = pgEnum("service_type", [
  "air_freight",
  "sea_freight",
  "road_freight",
  "rail_freight",
]);

export const serviceDirectionEnum = pgEnum("service_direction", [
  "import",
  "export",
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

// ============================================================================
// TABLE DEFINITIONS - ALL TABLES FIRST
// ============================================================================

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  twoFactorEnabled: boolean("two_factor_enabled").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  orgType: text("org_type"),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
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
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const twoFactor = pgTable("twoFactor", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  secret: text("secret").notNull(),
  backupCodes: text("backup_codes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const activityEvent = pgTable("activity_event", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  actorUserId: text("actor_user_id").references(() => user.id, { onDelete: "set null" }),
  type: text("type").notNull(),
  entityType: text("entity_type"),
  entityId: text("entity_id"),
  payload: jsonb("payload").$type<Record<string, unknown> | null>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const organization = pgTable("organization", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  name: text("name").notNull(),
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

export const organizationConnection = pgTable(
  "organization_connection",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    shipperOrganizationId: text("shipper_organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    forwarderOrganizationId: text("forwarder_organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    status: connectionStatusEnum("status").notNull().default("pending"),
    invitedById: text("invited_by_id")
      .notNull()
      .references(() => user.id),
    acceptedById: text("accepted_by_id").references(() => user.id),
    acceptedAt: timestamp("accepted_at"),
    createdAt: timestamp("created_at")
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestamp("updated_at")
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => ({
    shipperForwarderUnique: unique().on(
      table.shipperOrganizationId,
      table.forwarderOrganizationId
    ),
  })
);

export const inquiry = pgTable("inquiry", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  referenceNumber: text("reference_number").notNull().unique(),
  shipperReference: text("shipper_reference"), // Optional reference from shipper's own system
  title: text("title").notNull(),
  description: text("description"),
  serviceType: serviceTypeEnum("service_type").notNull().default("air_freight"),
  serviceDirection: serviceDirectionEnum("service_direction").notNull().default("import"),
  originAirport: text("origin_airport").notNull(),
  originCity: text("origin_city").notNull(),
  originCountry: text("origin_country").notNull(),
  destinationAirport: text("destination_airport").notNull(),
  destinationCity: text("destination_city").notNull(),
  destinationCountry: text("destination_country").notNull(),
  cargoType: cargoTypeEnum("cargo_type").notNull().default("general"),
  cargoDescription: text("cargo_description"),
  incoterms: text("incoterms").notNull(), // Add incoterms to inquiry
  readyDate: timestamp("ready_date").notNull(),
  deliveryDate: timestamp("delivery_date"),
  validityDate: timestamp("validity_date"),
  status: inquiryStatusEnum("status").notNull().default("draft"),
  sentAt: timestamp("sent_at"), // When inquiry was sent to forwarders
  closedAt: timestamp("closed_at"), // When inquiry was closed/awarded
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

export const inquiryDocument = pgTable("inquiry_document", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  inquiryId: text("inquiry_id")
    .notNull()
    .references(() => inquiry.id, { onDelete: "cascade" }),
  uploadedByOrganizationId: text("uploaded_by_organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  uploadedByUserId: text("uploaded_by_user_id")
    .notNull()
    .references(() => user.id),
  documentType: inquiryDocumentTypeEnum("document_type").notNull(),
  fileName: text("file_name").notNull(),
  fileType: text("file_type"),
  fileSize: integer("file_size"),
  fileKey: text("file_key").notNull(),
  fileUrl: text("file_url").notNull(),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

export const inquiryPackage = pgTable("inquiry_package", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  inquiryId: text("inquiry_id")
    .notNull()
    .references(() => inquiry.id, { onDelete: "cascade" }),
  packageNumber: text("package_number").notNull(),
  description: text("description"),
  pieces: integer("pieces").notNull().default(1),
  grossWeight: decimal("gross_weight", { precision: 10, scale: 3 }).notNull(),
  chargeableWeight: decimal("chargeable_weight", { precision: 10, scale: 3 }),
  length: decimal("length", { precision: 8, scale: 2 }),
  width: decimal("width", { precision: 8, scale: 2 }),
  height: decimal("height", { precision: 8, scale: 2 }),
  volume: decimal("volume", { precision: 10, scale: 6 }),
  temperature: text("temperature"),
  specialHandling: text("special_handling"),
  isDangerous: boolean("is_dangerous").default(false),
  dangerousGoodsClass: text("dangerous_goods_class"),
  unNumber: text("un_number"),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

export const inquiryForwarder = pgTable(
  "inquiry_forwarder",
  {
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
    rejectedAt: timestamp("rejected_at"),
    responseStatus: forwarderResponseStatusEnum("response_status")
      .default("pending")
      .notNull(),
    createdAt: timestamp("created_at")
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => ({
    inquiryForwarderUnique: unique().on(table.inquiryId, table.forwarderOrganizationId),
  })
);

export const quotation = pgTable(
  "quotation",
  {
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
    airlineFlight: text("airline_flight"), // Combined airline code and flight number
    transitTime: integer("transit_time"),
    validUntil: timestamp("valid_until").notNull(),
    notes: text("notes"),
    terms: text("terms"),
    preCarriage: decimal("pre_carriage", { precision: 12, scale: 2 }).default("0"), // Pre-carriage cost
    mainCarriage: decimal("main_carriage", { precision: 12, scale: 2 }).default("0"), // Main carriage cost
    onCarriage: decimal("on_carriage", { precision: 12, scale: 2 }).default("0"), // On-carriage cost
    additionalCharges: decimal("additional_charges", { precision: 12, scale: 2 }).default("0"), // Additional charges
    status: quotationStatusEnum("status").notNull().default("draft"),
    submittedAt: timestamp("submitted_at"), // When quotation was submitted (not default)
    respondedAt: timestamp("responded_at"), // When shipper responded (accepted/rejected)
    createdById: text("created_by_id")
      .notNull()
      .references(() => user.id),
    createdAt: timestamp("created_at")
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestamp("updated_at")
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => ({
    inquiryForwarderQuotationUnique: unique().on(table.inquiryId, table.forwarderOrganizationId),
  })
);

// Removed quotationCharge table - charges are now columns in quotation table

export const subscription = pgTable("subscription", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" })
    .unique(),
  tier: subscriptionTierEnum("tier").notNull().default("basic"),
  status: subscriptionStatusEnum("status").notNull().default("active"),
  
  // Forwarder Limits
  maxQuotationsPerMonth: integer("max_quotations_per_month").default(5),
  maxInquiriesPerMonth: integer("max_inquiries_per_month"), // For future use
  maxTeamMembers: integer("max_team_members"), // For future use
  
  // Features (JSON for flexibility)
  features: text("features"), // JSON string for future features
  
  // Polar.sh integration (for later)
  // polarSubscriptionId: text("polar_subscription_id"),
  // polarCustomerId: text("polar_customer_id"),
  
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
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

export const inquiryNote = pgTable("inquiry_note", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),

  inquiryId: text("inquiry_id")
    .notNull()
    .references(() => inquiry.id, { onDelete: "cascade" }),

  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id),

  userId: text("user_id")
    .notNull()
    .references(() => user.id),

  content: text("content").notNull(),

  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

// ============================================================================
// RELATIONS - ALL RELATIONS AFTER ALL TABLES
// ============================================================================

export const userRelations = relations(user, ({ many }) => ({
  organizationMemberships: many(organizationMember),
  createdInquiries: many(inquiry),
  createdQuotations: many(quotation),
  sessions: many(session),
  accounts: many(account),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const twoFactorRelations = relations(twoFactor, ({ one }) => ({
  user: one(user, {
    fields: [twoFactor.userId],
    references: [user.id],
  }),
}));

export const activityEventRelations = relations(activityEvent, ({ one }) => ({
  organization: one(organization, {
    fields: [activityEvent.organizationId],
    references: [organization.id],
  }),
  actor: one(user, {
    fields: [activityEvent.actorUserId],
    references: [user.id],
  }),
}));

export const organizationRelations = relations(organization, ({ many }) => ({
  members: many(organizationMember),
  connectionsAsShipper: many(organizationConnection, {
    relationName: "shipperOrganization",
  }),
  connectionsAsForwarder: many(organizationConnection, {
    relationName: "forwarderOrganization",
  }),
  inquiriesAsShipper: many(inquiry, {
    relationName: "shipperOrganization"
  }),
  quotationsAsForwarder: many(quotation, {
    relationName: "forwarderOrganization"
  }),
  receivedInquiries: many(inquiryForwarder),
  chargeTemplates: many(chargeTemplate),
}));

export const organizationMemberRelations = relations(organizationMember, ({ one }) => ({
  organization: one(organization, {
    fields: [organizationMember.organizationId],
    references: [organization.id],
  }),
  user: one(user, {
    fields: [organizationMember.userId],
    references: [user.id],
  }),
}));

export const organizationConnectionRelations = relations(organizationConnection, ({ one }) => ({
  shipperOrganization: one(organization, {
    fields: [organizationConnection.shipperOrganizationId],
    references: [organization.id],
    relationName: "shipperOrganization",
  }),
  forwarderOrganization: one(organization, {
    fields: [organizationConnection.forwarderOrganizationId],
    references: [organization.id],
    relationName: "forwarderOrganization",
  }),
  invitedBy: one(user, {
    fields: [organizationConnection.invitedById],
    references: [user.id],
    relationName: "connectionInvitedBy",
  }),
  acceptedBy: one(user, {
    fields: [organizationConnection.acceptedById],
    references: [user.id],
    relationName: "connectionAcceptedBy",
  }),
}));

export const inquiryRelations = relations(inquiry, ({ one, many }) => ({
  shipperOrganization: one(organization, {
    fields: [inquiry.shipperOrganizationId],
    references: [organization.id],
    relationName: "shipperOrganization"
  }),
  createdBy: one(user, {
    fields: [inquiry.createdById],
    references: [user.id],
  }),
  packages: many(inquiryPackage),
  sentToForwarders: many(inquiryForwarder),
  quotations: many(quotation),
  documents: many(inquiryDocument),
}));

export const inquiryPackageRelations = relations(inquiryPackage, ({ one }) => ({
  inquiry: one(inquiry, {
    fields: [inquiryPackage.inquiryId],
    references: [inquiry.id],
  }),
}));

export const inquiryForwarderRelations = relations(inquiryForwarder, ({ one }) => ({
  inquiry: one(inquiry, {
    fields: [inquiryForwarder.inquiryId],
    references: [inquiry.id],
  }),
  forwarderOrganization: one(organization, {
    fields: [inquiryForwarder.forwarderOrganizationId], 
    references: [organization.id],
  }),
}));

export const quotationRelations = relations(quotation, ({ one }) => ({
  inquiry: one(inquiry, {
    fields: [quotation.inquiryId],
    references: [inquiry.id],
  }),
  forwarderOrganization: one(organization, {
    fields: [quotation.forwarderOrganizationId],
    references: [organization.id],
    relationName: "forwarderOrganization"
  }),
  createdBy: one(user, {
    fields: [quotation.createdById],
    references: [user.id],
  }),
  // charges are now columns in quotation table
}));

export const inquiryDocumentRelations = relations(inquiryDocument, ({ one }) => ({
  inquiry: one(inquiry, {
    fields: [inquiryDocument.inquiryId],
    references: [inquiry.id],
  }),
  uploadedByOrganization: one(organization, {
    fields: [inquiryDocument.uploadedByOrganizationId],
    references: [organization.id],
  }),
  uploadedByUser: one(user, {
    fields: [inquiryDocument.uploadedByUserId],
    references: [user.id],
  }),
}));

// Removed quotationCharge relations - charges are now columns in quotation table

export const chargeTemplateRelations = relations(chargeTemplate, ({ one }) => ({
  organization: one(organization, {
    fields: [chargeTemplate.organizationId],
    references: [organization.id],
  }),
}));

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type InsertUser = typeof user.$inferInsert;
export type SelectUser = typeof user.$inferSelect;
export type InsertOrganization = typeof organization.$inferInsert;
export type SelectOrganization = typeof organization.$inferSelect;
export type InsertOrganizationMember = typeof organizationMember.$inferInsert;
export type SelectOrganizationMember = typeof organizationMember.$inferSelect;
export type InsertOrganizationConnection = typeof organizationConnection.$inferInsert;
export type SelectOrganizationConnection = typeof organizationConnection.$inferSelect;
export type InsertInquiry = typeof inquiry.$inferInsert;
export type SelectInquiry = typeof inquiry.$inferSelect;
export type InsertInquiryPackage = typeof inquiryPackage.$inferInsert;
export type SelectInquiryPackage = typeof inquiryPackage.$inferSelect;
export type InsertInquiryDocument = typeof inquiryDocument.$inferInsert;
export type SelectInquiryDocument = typeof inquiryDocument.$inferSelect;
export type InsertInquiryForwarder = typeof inquiryForwarder.$inferInsert;
export type SelectInquiryForwarder = typeof inquiryForwarder.$inferSelect;
export type InsertQuotation = typeof quotation.$inferInsert;
export type SelectQuotation = typeof quotation.$inferSelect;
// Removed quotationCharge types - charges are now columns in quotation table
export type InsertChargeTemplate = typeof chargeTemplate.$inferInsert;
export type SelectChargeTemplate = typeof chargeTemplate.$inferSelect;
export type InsertActivityEvent = typeof activityEvent.$inferInsert;
export type SelectActivityEvent = typeof activityEvent.$inferSelect;