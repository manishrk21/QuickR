
// import type { Metadata } from "next";
// import { Inter } from "next/font/google";
// import "./globals.css";
// import { validateEnv } from "@/lib/env";
// import Script from "next/script"; 



// const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

// export const metadata: Metadata = {
//   title: "QuickR",
//   description: "Contactless ordering for modern restaurants",
// };

// validateEnv();

// export default function RootLayout({ children }: { children: React.ReactNode }) {
//   return (
//     <html lang="en">
//       <body className={inter.variable + " font-sans antialiased"}>
//         {children}
//       </body>
//     </html>
//   );
// }


// apps/web/app/layout.tsx 
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { validateEnv } from "@/lib/env";
import Script from "next/script"; // 1. Imported Next.js Script component

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "QuickR",
  description: "Contactless ordering for modern restaurants",
};

validateEnv();

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* 2. Added Google Tag Scripts */}
        <Script
          src="https://googletagmanager.com"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-XZ4XN11Z32');
          `}
        </Script>
      </head>
      <body className={inter.variable + " font-sans antialiased"}>
        {children}
      </body>
    </html>
  );
}
