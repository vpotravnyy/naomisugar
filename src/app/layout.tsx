import { Inter } from "next/font/google";
import "~/styles/globals.css";
import type { Viewport } from "next";
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
	generator: "Next.js",
	applicationName: "NaomiSugar",
	referrer: "origin-when-cross-origin",
	keywords: ["Next.js", "React", "JavaScript"],
	creator: "Viacheslav Potravnyi",
	publisher: "Viacheslav Potravnyi",
	formatDetection: {
		email: false,
		address: false,
		telephone: false,
	},
	icons: {
		icon: "/images/naomisugar_192.png",
		shortcut: "/images/naomisugar_192.png",
		apple: "/images/apple-touch-icon.png",
		other: {
			rel: "apple-touch-icon-precomposed",
			url: "/apple-touch-icon.png",
		},
	},
	manifest: "/manifest.json",
	appleWebApp: {
		title: "NaomiSugar",
		statusBarStyle: "black-translucent",
		startupImage: ["/images/naomisugar_192.png"],
	},
	other: {
		"full-screen": "yes",
		"apple-mobile-web-app-capable": "yes",
		"mobile-web-app-capable": "yes",
	},
};

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
	maximumScale: 1,
	userScalable: false,
	themeColor: "white",
	colorScheme: "light",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body
				className={`antialiased ${fontHeading.variable} ${fontBody.variable}`}
			>
				<TRPCReactProvider>{children}</TRPCReactProvider>
			</body>
		</html>
	);
}
