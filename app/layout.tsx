import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Hyphosphere — research terrain',
  description: 'A human-directed, agent-extended investigation canvas for following relationships across heterogeneous evidence.',
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
