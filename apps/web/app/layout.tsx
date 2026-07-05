
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { validateEnv } from "@/lib/env";



const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "QuickR",
  description: "Contactless ordering for modern restaurants",
};

validateEnv();

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.variable + " font-sans antialiased"}>
        {children}
      </body>
    </html>
  );
}
