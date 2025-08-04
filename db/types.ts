import { InferInsertModel, InferSelectModel } from "drizzle-orm"
import { client, clientTopics, publisher, topics } from "./schema"

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