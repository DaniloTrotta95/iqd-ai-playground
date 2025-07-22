"use server";

import { db } from "@/db/drizzle";
import { publisher } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

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
		// Get the current user session
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session || !session.user) {
			throw new Error("Unauthorized");
		}

		// Get all publishers
		const publishers = await db
			.select()
			.from(publisher)
			.orderBy(publisher.name);

		return {
			success: true,
			data: publishers,
		};
	} catch (error) {
		console.error("Error fetching publishers:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Failed to fetch publishers",
		};
	}
};




