"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import Image from "next/image";
import UserDropdown from "./user-dropdown";
import { useSession } from "@/lib/auth-client";

export default function Navbar() {
	const { data: session, isPending } = useSession();

	return (
		<nav className="flex justify-between items-center py-3 h-16 px-4 fixed border-b border-sidebar-border top-0 left-0 right-0 z-50 bg-white">
			<Link href="/" className="text-xl font-bold">
				<Image src="/logo.png" alt="logo" width={180} height={32} />
			</Link>
			{isPending ? (
				<div className="h-10 w-20 bg-gray-200 animate-pulse rounded"></div>
			) : session ? (
				<UserDropdown user={session.user} />
			) : (
				<>
					<Link href="/sign-in">
						<Button>Anmelden</Button>
					</Link>
				</>
			)}
		</nav>
	);
}
