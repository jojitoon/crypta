'use client';
import { Inter } from 'next/font/google';
import './globals.css';
import { ConvexReactClient } from 'convex/react';
import { ConvexAuthProvider } from '@convex-dev/auth/react';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'] });

const convex = new ConvexReactClient(
  process.env.NEXT_PUBLIC_CONVEX_URL as string
);

// export const metadata: Metadata = {
//   title: 'Crypta Admin',
//   description: 'Admin panel for Crypta learning platform',
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body className={inter.className}>
        <ConvexAuthProvider client={convex}>
          {children}
          <Toaster />
        </ConvexAuthProvider>
      </body>
    </html>
  );
}
