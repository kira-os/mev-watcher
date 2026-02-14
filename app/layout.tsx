import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Solana MEV Watcher',
  description: 'Real-time MEV visualization for Solana',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
