import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { StripeProvider } from "@/contexts/StripeContext";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Stripe Dashboard MVP",
  description: "Custom Stripe Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <StripeProvider>
          <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-sm">
              <div className="container mx-auto px-4">
                <div className="flex justify-between items-center py-4">
                  <Link href="/dashboard" className="text-lg font-semibold">
                    Stripe Dashboard
                  </Link>
                  <div className="space-x-4">
                    <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                      Dashboard
                    </Link>
                    <Link href="/settings" className="text-gray-600 hover:text-gray-900">
                      Settings
                    </Link>
                  </div>
                </div>
              </div>
            </nav>
            <main>
              {children}
            </main>
          </div>
        </StripeProvider>
      </body>
    </html>
  );
}
