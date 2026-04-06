import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Skarion - Advancing Careers Through Specialized Training",
  description: "Skarion is dedicated to shaping the next generation of telecom professionals. Through specialized training in OSP, AutoCAD, and GIS, we equip candidates with hands-on skills and dedicated job placement support to help them thrive in the industry.",
  keywords: [
    "Skarion",
    "Outside Plant Engineering",
    "OSP Training",
    "OSP Job Placement",
    "Telecom Career",
    "AutoCAD Training",
    "GIS Training",
    "Fiber Optics Training",
    "Telecommunications Engineering",
    "OSP Design",
    "OSP Career",
    "Outside Plant Design",
    "Telecom Infrastructure Training",
    "Network Engineering",
    "OSP Certification",
    "Career Placement",
  ],
  openGraph: {
    title: "Skarion - Advancing Careers Through Specialized Training",
    description: "Skarion is dedicated to shaping the next generation of telecom professionals. Through specialized training in OSP, AutoCAD, and GIS, we equip candidates with hands-on skills and dedicated job placement support to help them thrive in the industry.",
    url: "https://skarion.com",
    siteName: "Skarion",
    images: [
      {
        url: "https://skarion.com/skarion-jpg.jpg",
        width: 1200,
        height: 630,
        alt: "Skarion",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Skarion - Advancing Careers Through Specialized Training",
    description: "Skarion is dedicated to shaping the next generation of telecom professionals. Through specialized training in OSP, AutoCAD, and GIS, we equip candidates with hands-on skills and dedicated job placement support to help them thrive in the industry.",
    images: ["https://skarion.com/skarion-jpg.jpg"],
  },
  verification: {
    other: {
      "msvalidate.01": "C6BC22315AAA3905A487DA8CF4F013C9",
    },
  },
  icons: {
    icon: "https://skarion.com/skarion.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SmoothScroll>
      <html lang="en">
        <body
          className={`${inter.variable} font-sans antialiased overflow-x-hidden`}
        >
          <main>
            <Toaster />
            {children}
          </main>
        </body>
      </html>
    </SmoothScroll>
  );
}
