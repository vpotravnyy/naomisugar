import { Inter } from "next/font/google";
import "~/styles/globals.css";

import { TRPCReactProvider } from "~/trpc/react";

const fontHeading = Inter({
	subsets: ["latin"],
	display: "swap",
	variable: "--font-heading",
});

const fontBody = Inter({
	subsets: ["latin"],
	display: "swap",
	variable: "--font-body",
});

export const metadata = {
	title: "NaomiSugar",
	description: "App to view data from LibreLinkUp servers",
	icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<head>
				<meta name="full-screen" content="yes" />
				<meta name="apple-mobile-web-app-capable" content="yes" />
				<meta name="mobile-web-app-capable" content="yes" />
				<meta name="apple-mobile-web-app-title" content="NaomiSugar" />
				<meta name="apple-mobile-web-app-status-bar-style" content="#22c55e" />
			</head>
			<body
				className={`antialiased ${fontHeading.variable} ${fontBody.variable}`}
			>
				<TRPCReactProvider>{children}</TRPCReactProvider>
			</body>
		</html>
	);
}
