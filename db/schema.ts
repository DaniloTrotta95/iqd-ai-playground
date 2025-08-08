import { InferInsertModel, InferSelectModel, sql } from "drizzle-orm";
import { boolean, pgEnum, pgTable, text, timestamp, serial, varchar, integer, decimal } from "drizzle-orm/pg-core";

export const topicEnum = pgEnum('topic', ['news', 'business', 'finance', 'sport', 'lifestyle', 'science', 'family', 'travel']);
export const clientTypeEnum = pgEnum('client_type', ['display', 'newsletter', 'podcast']);


export const user = pgTable("user", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("email_verified")
	  .$defaultFn(() => false)
	  .notNull(),
	image: text("image"),
	createdAt: timestamp("created_at")
	  .$defaultFn(() => /* @__PURE__ */ new Date())
	  .notNull(),
	updatedAt: timestamp("updated_at")
	  .$defaultFn(() => /* @__PURE__ */ new Date())
	  .notNull(),
	role: text("role"),
	banned: boolean("banned"),
	banReason: text("ban_reason"),
	banExpires: timestamp("ban_expires"),
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
	impersonatedBy: text("impersonated_by"),
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
	createdAt: timestamp("created_at").$defaultFn(
	  () => /* @__PURE__ */ new Date(),
	),
	updatedAt: timestamp("updated_at").$defaultFn(
	  () => /* @__PURE__ */ new Date(),
	),
  });

export const publisher = pgTable("publisher", {
	id: text("id").primaryKey().default(sql`gen_random_uuid()`),
	name: text("name").notNull(),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
});

export const client = pgTable("client", {
	id: text("id").primaryKey().default(sql`gen_random_uuid()`),
	publisherId: text("publisher_id")
		.notNull()
		.references(() => publisher.id, { onDelete: "cascade" }),
	name: text("name").notNull(),
	url: text("url"),
	agmaEntityId: text("agma_entity_id"),
	clientType: clientTypeEnum("client_type").notNull().default('display'),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
});

export const topics = pgTable("topics", {
	id: text("id").primaryKey().default(sql`gen_random_uuid()`),
	name: text("name").notNull(),
	label: text("label").notNull(),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
});

export const clientTopics = pgTable("client_topics", {
	id: text("id").primaryKey().default(sql`gen_random_uuid()`),
	clientId: text("client_id")
		.notNull()
		.references(() => client.id, { onDelete: "cascade" }),
	topicId: text("topic_id")
		.notNull()
		.references(() => topics.id, { onDelete: "cascade" }),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
});

// Enums for better type safety and performance
export const productCategoryEnum = pgEnum('product_category', [
	'banner',
	'video',
	'audio',
	'interactive',
	'newsletter',
	'social',
	'display',
	'native'
  ]);
  
  export const formatEnum = pgEnum('format', [
	'jpg',
	'png',
	'gif',
	'webp',
	'svg',
	'mp4',
	'webm',
	'html5_zip',
	'html',
	'css',
	'js'
  ]);
  
  export const usageContextEnum = pgEnum('usage_context', [
	'mobile',
	'desktop',
	'tablet',
	'stationary',
	'video',
	'newsletter',
	'audio',
	'web',
	'app'
  ]);
  
  // Main products table
  export const products = pgTable('products', {
	id: serial('id').primaryKey(),
	name: varchar('name', { length: 255 }).notNull(),
	productCategory: productCategoryEnum('product_category').notNull(),
	
	// Dimensions
	width: integer('width'), // in pixels
	height: integer('height'), // in pixels
	
	// File sizes in KB
	weightKb: decimal('weight_kb', { precision: 10, scale: 2 }).notNull(),
	ecoAdWeightKb: decimal('eco_ad_weight_kb', { precision: 10, scale: 2 }),
	
	// Additional useful fields
	description: varchar('description', { length: 1000 }),
	isActive: boolean('is_active').default(true),
	url: text('url'),
	
	// Timestamps
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow()
  });
  
  // Junction table for formats (many-to-many relationship)
  export const productFormats = pgTable('product_formats', {
	id: serial('id').primaryKey(),
	productId: integer('product_id').references(() => products.id).notNull(),
	format: formatEnum('format').notNull(),
	
	createdAt: timestamp('created_at').defaultNow()
  });
  
  // Junction table for usage contexts (many-to-many relationship)
  export const productUsageContexts = pgTable('product_usage_contexts', {
	id: serial('id').primaryKey(),
	productId: integer('product_id').references(() => products.id).notNull(),
	usageContext: usageContextEnum('usage_context').notNull(),
	
	createdAt: timestamp('created_at').defaultNow()
  });
  
  // Additional specifications table for flexible key-value pairs
  export const productTechSpecs = pgTable('product_tech_specs', {
	id: serial('id').primaryKey(),
	productId: integer('product_id').references(() => products.id).notNull(),
	specName: varchar('spec_name', { length: 100 }).notNull(), // e.g., 'frame_rate', 'bitrate', 'color_depth'
	specValue: varchar('spec_value', { length: 500 }).notNull(), // e.g., '30fps', '128kbps', '24bit'
	specType: varchar('spec_type', { length: 50 }), // e.g., 'video', 'audio', 'display'
	
	createdAt: timestamp('created_at').defaultNow()
  });
  


export const schema = {
	user,
	session,
	account,
	verification,
	publisher,
	client,
	topics,
	clientTopics,
	products,
	productFormats,
	productUsageContexts,
	productTechSpecs,
};
