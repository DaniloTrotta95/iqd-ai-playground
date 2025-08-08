import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins"


export const authClient = createAuthClient({
	baseURL: process.env.BETTER_AUTH_URL ?? "", // the base url of your auth server
	plugins: [
        adminClient()
    ]
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

const signUpWithEmail = async (data: any) => {
	const response = await authClient.signUp.email(data);
	return response;
};

const signInWithEmail = async (data: any) => {
	const response = await authClient.signIn.email(data);
	return response;
};


export const { signIn, signUp, useSession, signOut } = authClient;
export type Session = typeof authClient.$Infer.Session;
export type User = typeof authClient.$Infer.Session.user;
export { signInWithGithub, signInWithDiscord, signUpWithEmail, signInWithEmail };
