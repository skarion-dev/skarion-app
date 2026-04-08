import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Skarion",
  description: "Skarion helps individuals confidently navigate the hiring process and secure top-tier roles through expert coaching, resume optimization, and hands-on training.",
  icons: {
    icon: "/skarion.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} font-sans antialiased overflow-x-hidden`}
      >
        <TooltipProvider>
          <main>
            <Toaster />
            {children}
          </main>
        </TooltipProvider>
      </body>
    </html>
  );
}
