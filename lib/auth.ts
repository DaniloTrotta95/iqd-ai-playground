import { schema } from "@/db/schema";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "../db/drizzle"; // your drizzle instance
import { admin } from "better-auth/plugins";

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg", // or "mysql", "sqlite"
		schema: schema,
	}),
	plugins: [nextCookies(), admin()], // make sure this is the last plugin in the array

	// Add trusted origins configuration
	trustedOrigins: [
		// Local development
		"http://localhost:3000",
		"http://127.0.0.1:3000",
		"*.vercel.app",
		// Production
		// process.env.BETTER_AUTH_URL,
		// Preview deployments (Vercel pattern)
		
		// Additional origins from environment variable (comma-separated)
		// ...(process.env.ADDITIONAL_TRUSTED_ORIGINS?.split(",").map(origin => origin.trim()) || []),
		// Add your specific production domain if different
		// "https://yourdomain.com",
	].filter(Boolean),

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
