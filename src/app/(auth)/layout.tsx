import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Skarion",
  description: "Sign in or create an account to access Skarion's specialized telecommunications training and job placement platform.",
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <main>{children}</main>;
}
