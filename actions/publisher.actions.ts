"use server";

import { db } from "@/db/drizzle";
import { client, publisher } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

export const createPublisher = async ({
	name,
}: {
	name: string;
}) => {
	try {
		// Get the current user session
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session || !session.user) {
			throw new Error("Unauthorized");
		}

		// Create the publisher
		const [newPublisher] = await db
			.insert(publisher)
			.values({
				name,
				createdAt: new Date(),
				updatedAt: new Date(),
			})
			.returning();

		// Revalidate the dashboard page to show the new publisher
		revalidatePath("/dashboard");

		return {
			success: true,
			data: newPublisher,
		};
	} catch (error) {
		console.error("Error creating publisher:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Failed to create publisher",
		};
	}
};

export const getPublishers = async () => {
	try {
		console.log('getPublishers')
		// Get the current user session
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session || !session.user) {
			throw new Error("Unauthorized");
		}

		// Get all publishers
		const publishers = await db
			.select({
				publisher: {
					id: publisher.id,
					name: publisher.name,
					createdAt: publisher.createdAt,
					updatedAt: publisher.updatedAt,
				},
				client: {
					id: client.id,
					name: client.name,
					url: client.url,
					agmaEntityId: client.agmaEntityId,
					clientType: client.clientType,
					createdAt: client.createdAt,
					updatedAt: client.updatedAt,
				},
			})
			.from(publisher)
			.leftJoin(client, eq(publisher.id, client.publisherId))
			.orderBy(publisher.name);


		const groupedPublishers = publishers.reduce((acc, row) => {
			const publisherId = row.publisher.id;
			
			if (!acc[publisherId]) {
				acc[publisherId] = {
					...row.publisher,
					clients: [],
				};
			}
			
			// Only add client if it exists (not null from left join)
			if (row.client && row.client.id) {
				acc[publisherId].clients.push(row.client);
			}
			
			return acc;
		}, {} as Record<string, any>);

		const result = Object.values(groupedPublishers);


		return {
			success: true,
			data: result,
		};
	} catch (error) {
		console.error("Error fetching publishers:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Failed to fetch publishers",
		};
	}
};





