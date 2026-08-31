import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Hyphosphere',
  description: 'A research terrain for following relationships across heterogeneous evidence.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
