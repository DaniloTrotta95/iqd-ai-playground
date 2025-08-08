export default async function Home() {
	// const session = await auth.api.getSession({
	// 	headers: await headers(),
	// });
	return (
		<main className="flex items-center justify-center grow p-8">
			<div className="flex flex-col items-center gap-4">
				<h1 className="text-7xl">IQ-D AI Playground</h1>
				<span className="text-sm text-gray-500">
					Willkommen im IQ-D AI Playground. Hier werden KI Lösungen getestet und entwickelt.
				</span>
				<span className="text-sm text-gray-500">
					Bitte melde dich an, um auf den Playground zuzugreifen.
				</span>
				{/* <p>You are logged in as: {session?.user?.email}</p> */}
			</div>
		</main>
	);
}
