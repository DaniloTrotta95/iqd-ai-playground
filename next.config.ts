import type { NextConfig } from "next";
import withLlamaIndex from "llamaindex/next";

/** @type {import('next').NextConfig} */


const nextConfig: NextConfig = {
	/* config options here */
	eslint: {
		ignoreDuringBuilds: true,
	  },
	  typescript: {
		ignoreBuildErrors: true,
	  },
};

export default withLlamaIndex(nextConfig);
