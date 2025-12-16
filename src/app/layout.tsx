import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { StripeProvider } from "@/contexts/StripeContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import DashboardShell from "@/components/DashboardShell";
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
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <StripeProvider>
          <ThemeProvider>
            <DashboardShell>
              {children}
            </DashboardShell>
          </ThemeProvider>
        </StripeProvider>
      </body>
    </html>
  );
}
