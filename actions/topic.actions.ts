"use server";

import { db } from "@/db/drizzle";
import { clientTopics, topics } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

export const createTopic = async ({
	name,
	label,
}: {
	name: string;
	label: string;
}) => {
	try {
		// Get the current user session
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session || !session.user) {
			throw new Error("Unauthorized");
		}

		// Create the topic
		const [newTopic] = await db
			.insert(topics)
			.values({
				name,
				label,
				createdAt: new Date(),
				updatedAt: new Date(),
			})
			.returning();

		// Revalidate the dashboard page to show the new topic
		revalidatePath("/");

		return {
			success: true,
			data: newTopic,
		};
	} catch (error) {
		console.error("Error creating topic:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Failed to create topic",
		};
	}
};

export const getTopics = async () => {
	try {
		// Get the current user session
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session || !session.user) {
			throw new Error("Unauthorized");
		}

		// Get all topics
		const allTopics = await db
			.select()
			.from(topics)
			.orderBy(topics.name);

		return {
			success: true,
			data: allTopics,
		};
	} catch (error) {
		console.error("Error fetching topics:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Failed to fetch topics",
		};
	}
};

export const createClientTopic = async ({
	clientId,
	topicId,
}: {
	clientId: string;
	topicId: string;
}) => {
	try {
		// Get the current user session
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session || !session.user) {
			throw new Error("Unauthorized");
		}

		// Create the client-topic relationship
		const [newClientTopic] = await db
			.insert(clientTopics)
			.values({
				clientId,
				topicId,
				createdAt: new Date(),
				updatedAt: new Date(),
			})
			.returning();

		// Revalidate the dashboard page to show the new relationship
		revalidatePath("/");

		return {
			success: true,
			data: newClientTopic,
		};
	} catch (error) {
		console.error("Error creating client topic:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Failed to create client topic",
		};
	}
};

export const getClientTopics = async () => {
	try {
		// Get the current user session
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session || !session.user) {
			throw new Error("Unauthorized");
		}

		// Get all client-topic relationships with topic information
		const clientTopicsWithTopics = await db
			.select({
				id: clientTopics.id,
				clientId: clientTopics.clientId,
				topicId: clientTopics.topicId,
				topicName: topics.name,
				topicLabel: topics.label,
				createdAt: clientTopics.createdAt,
				updatedAt: clientTopics.updatedAt,
			})
			.from(clientTopics)
			.leftJoin(topics, eq(clientTopics.topicId, topics.id))
			.orderBy(clientTopics.createdAt);

		return {
			success: true,
			data: clientTopicsWithTopics,
		};
	} catch (error) {
		console.error("Error fetching client topics:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Failed to fetch client topics",
		};
	}
};

export const deleteClientTopic = async ({
	id,
}: {
	id: string;
}) => {
	try {
		await db.delete(clientTopics).where(eq(clientTopics.id, id));
	} catch (error) {
		console.error("Error deleting client topic:", error);
	}
};

export const updateClientTopic = async ({
	id,
	topicId,
}: {
	id: string;
	topicId: string;
}) => {
	try {
		await db.update(clientTopics).set({ topicId }).where(eq(clientTopics.id, id));
	} catch (error) {
		console.error("Error updating client topic:", error);
	}
};

export const updateAssociatedClientForTopic = async ({
	id,
	clientId,
}: {
	id: string;
	clientId: string;
}) => {
	try {
		await db.update(clientTopics).set({ clientId }).where(eq(clientTopics.id, id));
	} catch (error) {
		console.error("Error updating associated client for topic:", error);
	}
};






