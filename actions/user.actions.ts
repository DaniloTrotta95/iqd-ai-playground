"use server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const signInWithDiscord = async () => {
	const response = await auth.api.signInSocial({
		body: {
			provider: "discord",
		},
		headers: await headers(),
	});
	if (response.url) {
		redirect(response.url);
	}
};

export const signInWithGithub = async () => {
	const response = await auth.api.signInSocial({
		body: {
			provider: "github",
		},
		headers: await headers(),
	});
	if (response.url) {
		redirect(response.url);
	}
};

export const signOut = async () => {
	const response = await auth.api.signOut({
		headers: await headers(),
	});
	if (response.success) {
		redirect("/");
	}
};

export const signInWithEmail = async ({
	email,
	password,
}: {
	email: string;
	password: string;
}) => {
	const response = await auth.api.signInEmail({
		body: {
			email,
			password,
		},
		headers: await headers(),
	});
};
