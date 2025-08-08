import AgentTest from "@/components/agent-test";
import PortfolioTable from "@/components/portfolio/portfolio-table";
import TechSpecTable from "@/components/techspecs/techspec-table";
import React from "react";

export default function TechSpecPage() {
	return (
		<section className="w-full mx-auto py-10">
			<h1 className="text-2xl font-bold">TechSpecs</h1>
			<TechSpecTable />
		</section>
	);
}
