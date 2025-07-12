import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
	title: 'todo title',
	description: 'things',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className="h-full w-full">
			<body className={'h-full w-full font-sans antialiased'}>
				<script src="https://accounts.google.com/gsi/client" async defer></script>
				{/* <body className={'font-serif antialiased'}> */}
				{/* <body className={'font-mono antialiased'}> */}
				{/* <body className={'font-code antialiased'}> */}
				{children}
			</body>
		</html>
	);
}
