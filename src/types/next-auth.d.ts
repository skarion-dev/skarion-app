import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      roles?: string[];
      permissions?: string[];
      image?: string | null;
      lastLogin?: string;
    };
    accessToken?: string;
  }

  interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    roles?: string[];
    permissions?: string[];
    image?: string | null;
    lastLogin?: string;
    accessToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    roles?: string[];
    permissions?: string[];
    image?: string | null;
    lastLogin?: string;
    accessToken?: string;
  }
}
