import { signInWithDiscord, signInWithGithub } from "@/actions/user.actions";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Link from "next/link";
import SignOut from "./signOut";
import { Button } from "./ui/button";

export default async function Navbar() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});
	console.log("session", session);
	return (
		<nav className="flex justify-between items-center py-3 px-4 fixed top-0 left-0 right-0 z-50 bg-slate-100">
			<Link href="/" className="text-xl font-bold">
				better-auth
			</Link>
			<Link href="/dashboard" className="text-xl font-bold">
				Dashboard
			</Link>
			{/* <AuthButtons /> */}
			{session ? (
				// <Button onClick={() => {}}>Sign out</Button>
				<SignOut />
			) : (
				<>
					<Button onClick={signInWithGithub}>Sign in with Github</Button>
					<Button onClick={signInWithDiscord}>Sign in with Discord</Button>
				</>
			)}
		</nav>
	);
}
