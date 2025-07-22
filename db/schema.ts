import { InferInsertModel, InferSelectModel, sql } from "drizzle-orm";
import { boolean, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const topicEnum = pgEnum('topic', ['news', 'business', 'finance', 'sport', 'lifestyle', 'science', 'family', 'travel']);
export const clientTypeEnum = pgEnum('client_type', ['display', 'newsletter', 'podcast']);


export const user = pgTable("user", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("email_verified").notNull(),
	image: text("image"),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
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
	createdAt: timestamp("created_at"),
	updatedAt: timestamp("updated_at"),
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

export const schema = {
	user,
	session,
	account,
	verification,
	publisher,
	client,
	topics,
	clientTopics,
};
