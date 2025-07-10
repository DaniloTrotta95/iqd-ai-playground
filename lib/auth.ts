import { schema } from "@/db/schema";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "../db/drizzle"; // your drizzle instance

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg", // or "mysql", "sqlite"
		schema: schema,
	}),
	plugins: [nextCookies()], // make sure this is the last plugin in the array

	emailAndPassword: {
		enabled: true,
		// TODO: add email verification -> MVP is not required
		// requireEmailVerification: true,
	},

	// emailVerification: {
	// 	sendOnSignUp: true,
	// 	autoSignInAfterVerification: true,
	// 	sendVerificationEmail: async ({ user, token }) => {
	// 		// eslint-disable-next-line @typescript-eslint/no-unused-vars
	// 		const verificationUrl = `${process.env.BETTER_AUTH_URL}/api/auth/verify-email?token=${token}&callbackUrl=${process.env.BETTER_AUTH_URL}`;
	// 		// eslint-disable-next-line @typescript-eslint/no-unused-vars
	// 		const email = user.email;


	// 		// await sendEmail({
	// 		// 	to: email,
	// 		// 	subject: "Verify your email",
	// 		// });
	// 	},
	// },
	// socialProviders: {
	// 	github: {
	// 		clientId: process.env.GITHUB_CLIENT_ID ?? "",
	// 		clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
	// 	},
	// 	discord: {
	// 		clientId: process.env.DISCORD_CLIENT_ID ?? "",
	// 		clientSecret: process.env.DISCORD_CLIENT_SECRET ?? "",
	// 	},
	// },
});
