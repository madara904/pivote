import { pgTable, text, timestamp, boolean, decimal, pgEnum, integer } from 'drizzle-orm/pg-core';
import { randomUUID } from 'crypto';

// Enums for the freight platform
export const organizationTypeEnum = pgEnum('organization_type', ['shipper', 'forwarder']);
export const memberRoleEnum = pgEnum('member_role', ['owner', 'admin', 'member']);
export const inquiryStatusEnum = pgEnum('inquiry_status', ['draft', 'sent', 'closed', 'cancelled']);
export const quotationStatusEnum = pgEnum('quotation_status', ['pending', 'submitted', 'accepted', 'rejected', 'expired']);
export const serviceTypeEnum = pgEnum('service_type', ['air_freight', 'sea_freight', 'road_freight', 'rail_freight']);
export const cargoTypeEnum = pgEnum('cargo_type', ['general', 'dangerous', 'perishable', 'fragile', 'oversized']);
export const chargeTypeEnum = pgEnum('charge_type', ['freight', 'local_origin', 'local_destination', 'fuel_surcharge', 'security_fee', 'handling', 'customs', 'insurance', 'other']);

// Better Auth generated schema (keep existing tables)
export const user = pgTable("user", {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').$defaultFn(() => false).notNull(),
  image: text('image'),
  createdAt: timestamp('created_at').$defaultFn(() => new Date()).notNull(),
  updatedAt: timestamp('updated_at').$defaultFn(() => new Date()).notNull()
});

export const session = pgTable("session", {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  activeOrganizationId: text('active_organization_id').references(() => organization.id, { onDelete: 'set null' })
});

export const account = pgTable("account", {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull()
});

export const verification = pgTable("verification", {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').$defaultFn(() => new Date()),
  updatedAt: timestamp('updated_at').$defaultFn(() => new Date())
});

// Better Auth Organization Plugin Tables
export const organization = pgTable("organization", {
  id: text('id').primaryKey().$defaultFn(() => randomUUID()),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  logo: text('logo'),
  metadata: text('metadata'), // Better Auth expects this field
  organizationType: organizationTypeEnum('organization_type').notNull(),
  // Company details
  address: text('address'),
  city: text('city'),
  postalCode: text('postal_code'),
  country: text('country'),
  phone: text('phone'),
  website: text('website'),
  taxNumber: text('tax_number'),
  // Forwarder specific
  services: text('services'), // JSON string of services offered
  certifications: text('certifications'), // JSON string of certifications
  coverageAreas: text('coverage_areas'), // JSON string of coverage areas
  createdAt: timestamp('created_at').$defaultFn(() => new Date()).notNull(),
  updatedAt: timestamp('updated_at').$defaultFn(() => new Date()).notNull()
});

export const member = pgTable("member", {
  id: text('id').primaryKey().$defaultFn(() => randomUUID()),
  organizationId: text('organization_id').notNull().references(() => organization.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  role: memberRoleEnum('role').notNull().default('member'),
  email: text('email').notNull(),
  createdAt: timestamp('created_at').$defaultFn(() => new Date()).notNull(),
  updatedAt: timestamp('updated_at').$defaultFn(() => new Date()).notNull()
});

export const invitation = pgTable("invitation", {
  id: text('id').primaryKey().$defaultFn(() => randomUUID()),
  organizationId: text('organization_id').notNull().references(() => organization.id, { onDelete: 'cascade' }),
  email: text('email').notNull(),
  role: memberRoleEnum('role').notNull().default('member'),
  status: text('status').notNull().default('pending'), // pending, accepted, rejected
  inviterId: text('inviter_id').notNull().references(() => user.id),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').$defaultFn(() => new Date()).notNull(),
  updatedAt: timestamp('updated_at').$defaultFn(() => new Date()).notNull()
});

// Freight specific tables
export const inquiry = pgTable("inquiry", {
  id: text('id').primaryKey().$defaultFn(() => randomUUID()),
  referenceNumber: text('reference_number').notNull().unique(),
  title: text('title').notNull(),
  description: text('description'),
  serviceType: serviceTypeEnum('service_type').notNull().default('air_freight'),
  
  // Origin and destination
  originAirport: text('origin_airport').notNull(), // IATA code
  originCity: text('origin_city').notNull(),
  originCountry: text('origin_country').notNull(),
  destinationAirport: text('destination_airport').notNull(), // IATA code
  destinationCity: text('destination_city').notNull(),
  destinationCountry: text('destination_country').notNull(),
  
  // Cargo details
  cargoType: cargoTypeEnum('cargo_type').notNull().default('general'),
  cargoDescription: text('cargo_description'),
  pieces: integer('pieces').notNull(),
  grossWeight: decimal('gross_weight', { precision: 10, scale: 2 }).notNull(), // in kg
  chargeableWeight: decimal('chargeable_weight', { precision: 10, scale: 2 }), // in kg
  dimensions: text('dimensions'), // JSON string: [{length, width, height, pieces}]
  
  // Dates
  readyDate: timestamp('ready_date').notNull(),
  deliveryDate: timestamp('delivery_date'),
  
  // Additional requirements
  temperature: text('temperature'), // ambient, chilled, frozen
  specialHandling: text('special_handling'), // JSON array of special requirements
  insuranceRequired: boolean('insurance_required').default(false),
  customsClearance: boolean('customs_clearance').default(false),
  
  // Status and relationships
  status: inquiryStatusEnum('status').notNull().default('draft'),
  shipperOrganizationId: text('shipper_organization_id').notNull().references(() => organization.id, { onDelete: 'cascade' }),
  createdById: text('created_by_id').notNull().references(() => user.id),
  
  createdAt: timestamp('created_at').$defaultFn(() => new Date()).notNull(),
  updatedAt: timestamp('updated_at').$defaultFn(() => new Date()).notNull()
});

export const inquiryForwarder = pgTable("inquiry_forwarder", {
  id: text('id').primaryKey().$defaultFn(() => randomUUID()),
  inquiryId: text('inquiry_id').notNull().references(() => inquiry.id, { onDelete: 'cascade' }),
  forwarderOrganizationId: text('forwarder_organization_id').notNull().references(() => organization.id, { onDelete: 'cascade' }),
  sentAt: timestamp('sent_at').$defaultFn(() => new Date()).notNull(),
  viewedAt: timestamp('viewed_at'),
  createdAt: timestamp('created_at').$defaultFn(() => new Date()).notNull()
});

export const quotation = pgTable("quotation", {
  id: text('id').primaryKey().$defaultFn(() => randomUUID()),
  quotationNumber: text('quotation_number').notNull().unique(),
  inquiryId: text('inquiry_id').notNull().references(() => inquiry.id, { onDelete: 'cascade' }),
  forwarderOrganizationId: text('forwarder_organization_id').notNull().references(() => organization.id, { onDelete: 'cascade' }),
  
  // Pricing summary
  totalPrice: decimal('total_price', { precision: 12, scale: 2 }).notNull(),
  currency: text('currency').notNull().default('EUR'),
  
  // Air freight specific
  airlineCode: text('airline_code'), // IATA airline code
  flightNumber: text('flight_number'),
  transitTime: integer('transit_time'), // in hours
  
  // Terms
  validUntil: timestamp('valid_until').notNull(),
  paymentTerms: text('payment_terms'), // e.g., "Net 30", "COD"
  incoterms: text('incoterms'), // e.g., "EXW", "FOB", "CIF"
  
  // Additional info
  notes: text('notes'),
  terms: text('terms'), // Terms and conditions
  
  // Status and timestamps
  status: quotationStatusEnum('status').notNull().default('pending'),
  submittedAt: timestamp('submitted_at').$defaultFn(() => new Date()).notNull(),
  respondedAt: timestamp('responded_at'),
  createdById: text('created_by_id').notNull().references(() => user.id),
  
  createdAt: timestamp('created_at').$defaultFn(() => new Date()).notNull(),
  updatedAt: timestamp('updated_at').$defaultFn(() => new Date()).notNull()
});

// Detailed cost breakdown for air freight
export const quotationCharge = pgTable("quotation_charge", {
  id: text('id').primaryKey().$defaultFn(() => randomUUID()),
  quotationId: text('quotation_id').notNull().references(() => quotation.id, { onDelete: 'cascade' }),
  
  chargeType: chargeTypeEnum('charge_type').notNull(),
  chargeName: text('charge_name').notNull(), // e.g., "Air Freight", "Fuel Surcharge", "Security Fee"
  chargeCode: text('charge_code'), // Internal code
  
  // Pricing
  unitPrice: decimal('unit_price', { precision: 12, scale: 4 }), // per kg or per shipment
  quantity: decimal('quantity', { precision: 10, scale: 2 }), // weight in kg or pieces
  unit: text('unit'), // 'kg', 'pcs', 'shipment'
  totalAmount: decimal('total_amount', { precision: 12, scale: 2 }).notNull(),
  currency: text('currency').notNull().default('EUR'),
  
  // Location specific (for local charges)
  location: text('location'), // 'origin', 'destination'
  
  description: text('description'),
  isOptional: boolean('is_optional').default(false),
  
  createdAt: timestamp('created_at').$defaultFn(() => new Date()).notNull(),
  updatedAt: timestamp('updated_at').$defaultFn(() => new Date()).notNull()
});

// Standard charge types for air freight (reference table)
export const chargeTemplate = pgTable("charge_template", {
  id: text('id').primaryKey().$defaultFn(() => randomUUID()),
  organizationId: text('organization_id').references(() => organization.id, { onDelete: 'cascade' }), // null for system defaults
  
  chargeName: text('charge_name').notNull(),
  chargeCode: text('charge_code').notNull(),
  chargeType: chargeTypeEnum('charge_type').notNull(),
  
  // Default pricing
  defaultUnitPrice: decimal('default_unit_price', { precision: 12, scale: 4 }),
  defaultUnit: text('default_unit'), // 'kg', 'pcs', 'shipment'
  defaultCurrency: text('default_currency').default('EUR'),
  
  // Applicability
  serviceType: serviceTypeEnum('service_type').notNull().default('air_freight'),
  location: text('location'), // 'origin', 'destination', 'both'
  
  description: text('description'),
  isActive: boolean('is_active').default(true),
  
  createdAt: timestamp('created_at').$defaultFn(() => new Date()).notNull(),
  updatedAt: timestamp('updated_at').$defaultFn(() => new Date()).notNull()
});

// Type exports
export type InsertUser = typeof user.$inferInsert;
export type SelectUser = typeof user.$inferSelect;
export type InsertOrganization = typeof organization.$inferInsert;
export type SelectOrganization = typeof organization.$inferSelect;
export type InsertMember = typeof member.$inferInsert;
export type SelectMember = typeof member.$inferSelect;
export type InsertInvitation = typeof invitation.$inferInsert;
export type SelectInvitation = typeof invitation.$inferSelect;
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