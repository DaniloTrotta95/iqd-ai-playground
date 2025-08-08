import AgentTest from "@/components/agent-test";
import PortfolioTable from "@/components/portfolio/portfolio-table";
import React, { Suspense } from "react";

export const dynamic = 'force-dynamic'
export default function DashboardPage() {
	return (
		<section className="w-full mx-auto py-10">
			<h1 className="text-2xl font-bold">IQ-Digital Portfolio</h1>
			<Suspense fallback={<div className="py-6">Laden...</div>}>
			<PortfolioTable />
			</Suspense>
		</section>
	);
}
