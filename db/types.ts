import { InferInsertModel, InferSelectModel } from "drizzle-orm"
import { client, clientTopics, products, productTechSpecs, productUsageContexts, productFormats, publisher, topics } from "./schema"

export type  Publisher = InferSelectModel<typeof publisher>
export type  Client = InferSelectModel<typeof client>
export type  Topic = InferSelectModel<typeof topics>

export type NewPublisher = InferInsertModel<typeof publisher>
export type NewClient = InferInsertModel<typeof client>
export type NewTopic = InferInsertModel<typeof topics>

export type ClientTopic = InferSelectModel<typeof clientTopics>
export type NewClientTopic = InferInsertModel<typeof clientTopics>

export type ClientWithPublisher = {
	id: string;
	name: string;
	url: string | null;
	agmaEntityId: string | null;
	clientType: 'display' | 'newsletter' | 'podcast';
	createdAt: Date;
	updatedAt: Date;
	publisherId: string;
	publisherName: string | null;
	topics: Array<{
		id: string;
		name: string;
		label: string;
	}>;
};

export type PublisherWithClients = Publisher & {
	clients: Client[];
};

  // Types for TypeScript inference
  export type Product = typeof products.$inferSelect;
  export type NewProduct = typeof products.$inferInsert;
  export type ProductUsageContext = typeof productUsageContexts.$inferSelect;
  export type ProductTechSpec = typeof productTechSpecs.$inferSelect;
  export type ProductFormat = typeof productFormats.$inferSelect;
  
  // Import the ProductWithSpecs type from techspec actions
  export type { ProductWithSpecs } from "@/actions/techspec.actions";