import { createAuthClient } from "better-auth/react";
export const authClient = createAuthClient({
	baseURL: process.env.BETTER_AUTH_URL ?? "", // the base url of your auth server
});

const signInWithGithub = async () => {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const data = await authClient.signIn.social({
		provider: "github",
	});
};

const signInWithDiscord = async () => {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const data = await authClient.signIn.social({
		provider: "discord",
	});
};

export const { signIn, signUp, useSession, signOut } = authClient;
export { signInWithGithub, signInWithDiscord };
