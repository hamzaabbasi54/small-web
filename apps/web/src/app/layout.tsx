import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'Small Web',
};

interface RootLayoutProps {
  children: ReactNode;
}

// Next.js puts the current page into children. This shell wraps every route.
export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
