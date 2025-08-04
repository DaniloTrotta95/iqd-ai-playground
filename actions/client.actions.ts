"use server";

import { db } from "@/db/drizzle";
import { client, clientTopics, publisher, topics } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { eq, asc } from "drizzle-orm";
import { createClientTopic } from "./topic.actions";

export const createClient = async ({
	publisherId,
	name,
	url,
	agmaEntityId,
	topicIds,
	clientType = 'display',
}: {
	publisherId: string;
	name: string;
	url?: string;
	agmaEntityId?: string;
	topicIds: string[];
	clientType?: 'display' | 'newsletter' | 'podcast';
}) => {
	try {
		// Get the current user session
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session || !session.user) {
			throw new Error("Unauthorized");
		}

		console.log(publisherId, name, url, topicIds, clientType, agmaEntityId);

		// Create the client
		const [newClient] = await db
			.insert(client)
			.values({
				publisherId,
				name,
				url: url || null,
				agmaEntityId: agmaEntityId || null,
				clientType,
				createdAt: new Date(),
				updatedAt: new Date(),
			})
			.returning();

		// Create client-topic relationships
		for (const topicId of topicIds) {
			await createClientTopic({
				clientId: newClient.id,
				topicId: topicId,
			});
		}

		// Revalidate the dashboard page to show the new client
		revalidatePath("/dashboard");

		return {
			success: true,
			data: newClient,
		};
	} catch (error) {
		console.error("Error creating client:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Failed to create client",
		};
	}
};

export const getAllClients = async () => {
	try {
		// Get the current user session
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session || !session.user) {
			throw new Error("Unauthorized");
		}

		// Fetch all clients with their associated publisher and topic information
		const clientsWithPublishersAndTopics = await db
			.select({
				id: client.id,
				name: client.name,
				url: client.url,
				agmaEntityId: client.agmaEntityId,
				clientType: client.clientType,
				createdAt: client.createdAt,
				updatedAt: client.updatedAt,
				publisherId: client.publisherId,
				publisherName: publisher.name,
				topicId: clientTopics.topicId,
				topicName: topics.name,
				topicLabel: topics.label,
			})
			.from(client)
			.leftJoin(publisher, eq(client.publisherId, publisher.id))
			.leftJoin(clientTopics, eq(client.id, clientTopics.clientId))
			.leftJoin(topics, eq(clientTopics.topicId, topics.id))
			.orderBy(asc(client.createdAt));

		// Group the results by client to handle multiple topics per client
		const clientsMap = new Map();
		
		clientsWithPublishersAndTopics.forEach((row) => {
			const clientId = row.id;
			
			if (!clientsMap.has(clientId)) {
				// Initialize client with basic info
				clientsMap.set(clientId, {
					id: row.id,
					name: row.name,
					url: row.url,
					agmaEntityId: row.agmaEntityId,
					clientType: row.clientType,
					createdAt: row.createdAt,
					updatedAt: row.updatedAt,
					publisherId: row.publisherId,
					publisherName: row.publisherName,
					topics: []
				});
			}
			
			// Add topic if it exists
			if (row.topicId && row.topicName && row.topicLabel) {
				const existingTopic = clientsMap.get(clientId).topics.find(
					(topic: any) => topic.id === row.topicId
				);
				
				if (!existingTopic) {
					clientsMap.get(clientId).topics.push({
						id: row.topicId,
						name: row.topicName,
						label: row.topicLabel
					});
				}
			}
		});

		// Convert map to array
		const clients = Array.from(clientsMap.values());


		return {
			success: true,
			data: clients,
		};
	} catch (error) {
		console.error("Error fetching clients:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Failed to fetch clients",
		};
	}
};

export const deleteClient = async ({
	id,
}: {
	id: string;
}) => {
	try {
		// Get the current user session
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session || !session.user) {
			throw new Error("Unauthorized");
		}

		await db.delete(client).where(eq(client.id, id));

		return {
			success: true,
		};
	} catch (error) {
		console.error("Error deleting client:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Failed to delete client",
		};
	}
}

export const updateClient = async ({
	id,
	name,
	url,
	agmaEntityId,
	topicIds,
	clientType,
}: {
	id: string;
	name: string;
	url?: string;
	agmaEntityId?: string;
	topicIds: string[];
	clientType?: 'display' | 'newsletter' | 'podcast';
}) => {
	try {
		// Get the current user session
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session || !session.user) {
			throw new Error("Unauthorized");
		}

		console.log(id, name, url, topicIds, clientType); 

		// Update the client
		await db.update(client).set({
			name,
			url,
			agmaEntityId,
			clientType,
			updatedAt: new Date(),
		}).where(eq(client.id, id));

		// Delete existing client-topic relationships
		await db.delete(clientTopics).where(eq(clientTopics.clientId, id));

		// Create new client-topic relationships
		for (const topicId of topicIds) {
			await createClientTopic({
				clientId: id,
				topicId: topicId,
			});
		}

		return {
			success: true,
		};
	} catch (error) {
		console.error("Error updating client:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Failed to update client",
		};
	}
}