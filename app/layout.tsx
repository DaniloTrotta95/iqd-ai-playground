import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/navbar";
import { Toaster } from "@/components/ui/sonner";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Angebotsunterstützung",
	description: "iq-digital KI Angebotsunterstützung und erstellung",
};

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased bg-muted`}
			>
				<Navbar />
				<div className="h-[calc(100vh-4rem)] px-6 py-4 mt-16">{children}</div>
				<Toaster />
			</body>
		</html>
	);
}
