import { pgTable, text, timestamp, boolean, decimal, pgEnum } from 'drizzle-orm/pg-core';
import { randomUUID } from 'crypto';

// Enums for the freight platform
export const userTypeEnum = pgEnum('user_type', ['company', 'forwarder']);
export const connectionStatusEnum = pgEnum('connection_status', ['pending', 'accepted', 'rejected']);
export const inquiryStatusEnum = pgEnum('inquiry_status', ['draft', 'sent', 'closed']);
export const quotationStatusEnum = pgEnum('quotation_status', ['pending', 'submitted', 'accepted', 'rejected']);

// Better Auth generated schema
export const user = pgTable("user", {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').$defaultFn(() => false).notNull(),
  image: text('image'),
  userType: userTypeEnum('user_type').default('company'),
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
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' })
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

// Custom tables for freight platform
export const company = pgTable("company", {
  id: text('id').primaryKey().$defaultFn(() => randomUUID()),
  name: text('name').notNull(),
  address: text('address'),
  contactPerson: text('contact_person'),
  phone: text('phone'),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').$defaultFn(() => new Date()).notNull(),
  updatedAt: timestamp('updated_at').$defaultFn(() => new Date()).notNull()
});

export const forwarder = pgTable("forwarder", {
  id: text('id').primaryKey().$defaultFn(() => randomUUID()),
  name: text('name').notNull(),
  address: text('address'),
  contactPerson: text('contact_person'),
  phone: text('phone'),
  services: text('services'), // e.g., "sea freight, air freight, customs"
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').$defaultFn(() => new Date()).notNull(),
  updatedAt: timestamp('updated_at').$defaultFn(() => new Date()).notNull()
});

export const connection = pgTable("connection", {
  id: text('id').primaryKey().$defaultFn(() => randomUUID()),
  companyId: text('company_id').notNull().references(() => company.id, { onDelete: 'cascade' }),
  forwarderId: text('forwarder_id').notNull().references(() => forwarder.id, { onDelete: 'cascade' }),
  status: connectionStatusEnum('status').notNull().default('pending'),
  invitedAt: timestamp('invited_at').$defaultFn(() => new Date()).notNull(),
  respondedAt: timestamp('responded_at'),
  createdAt: timestamp('created_at').$defaultFn(() => new Date()).notNull(),
  updatedAt: timestamp('updated_at').$defaultFn(() => new Date()).notNull()
});

export const inquiry = pgTable("inquiry", {
  id: text('id').primaryKey().$defaultFn(() => randomUUID()),
  title: text('title').notNull(),
  description: text('description'),
  originPort: text('origin_port').notNull(),
  destinationPort: text('destination_port').notNull(),
  cargoType: text('cargo_type'),
  weight: decimal('weight', { precision: 10, scale: 2 }),
  volume: decimal('volume', { precision: 10, scale: 2 }),
  pickupDate: timestamp('pickup_date'),
  deliveryDate: timestamp('delivery_date'),
  status: inquiryStatusEnum('status').notNull().default('draft'),
  companyId: text('company_id').notNull().references(() => company.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').$defaultFn(() => new Date()).notNull(),
  updatedAt: timestamp('updated_at').$defaultFn(() => new Date()).notNull()
});

export const inquiryForwarder = pgTable("inquiry_forwarder", {
  id: text('id').primaryKey().$defaultFn(() => randomUUID()),
  inquiryId: text('inquiry_id').notNull().references(() => inquiry.id, { onDelete: 'cascade' }),
  forwarderId: text('forwarder_id').notNull().references(() => forwarder.id, { onDelete: 'cascade' }),
  sentAt: timestamp('sent_at').$defaultFn(() => new Date()).notNull(),
  createdAt: timestamp('created_at').$defaultFn(() => new Date()).notNull()
});

export const quotation = pgTable("quotation", {
  id: text('id').primaryKey().$defaultFn(() => randomUUID()),
  inquiryId: text('inquiry_id').notNull().references(() => inquiry.id, { onDelete: 'cascade' }),
  forwarderId: text('forwarder_id').notNull().references(() => forwarder.id, { onDelete: 'cascade' }),
  price: decimal('price', { precision: 12, scale: 2 }).notNull(),
  currency: text('currency').notNull().default('USD'),
  validUntil: timestamp('valid_until'),
  notes: text('notes'),
  status: quotationStatusEnum('status').notNull().default('pending'),
  submittedAt: timestamp('submitted_at').$defaultFn(() => new Date()).notNull(),
  respondedAt: timestamp('responded_at'),
  createdAt: timestamp('created_at').$defaultFn(() => new Date()).notNull(),
  updatedAt: timestamp('updated_at').$defaultFn(() => new Date()).notNull()
});

// Type exports
export type InsertUser = typeof user.$inferInsert;
export type SelectUser = typeof user.$inferSelect;
export type InsertVerification = typeof verification.$inferInsert;
export type SelectVerification = typeof verification.$inferSelect;

export type InsertCompany = typeof company.$inferInsert;
export type SelectCompany = typeof company.$inferSelect;
export type InsertForwarder = typeof forwarder.$inferInsert;
export type SelectForwarder = typeof forwarder.$inferSelect;
export type InsertConnection = typeof connection.$inferInsert;
export type SelectConnection = typeof connection.$inferSelect;
export type InsertInquiry = typeof inquiry.$inferInsert;
export type SelectInquiry = typeof inquiry.$inferSelect;
export type InsertInquiryForwarder = typeof inquiryForwarder.$inferInsert;
export type SelectInquiryForwarder = typeof inquiryForwarder.$inferSelect;
export type InsertQuotation = typeof quotation.$inferInsert;
export type SelectQuotation = typeof quotation.$inferSelect;