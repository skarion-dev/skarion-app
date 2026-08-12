import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { getApiUrl } from "@/lib/utils";

const cookieDomain = process.env.NEXT_PUBLIC_COOKIE_DOMAIN?.trim() || undefined;

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("[Auth] authorize callback triggered for email:", credentials?.email);
        if (!credentials?.email || !credentials.password) {
          console.log("[Auth] Missing credentials");
          return null;
        }

        console.log("[Auth] Fetching from:", getApiUrl("/auth/login"));
        try {
          const res = await fetch(
            getApiUrl("/auth/login"),
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(credentials),
            },
          );

          console.log("[Auth] Fetch response status:", res.status);
          const data = await res.json();
          console.log("[Auth] Fetch response parsed successfully.");
          
          if (!data?.id) {
            console.error("[Auth] Login failed due to missing user ID:", data);
            return null;
          }

          console.log("[Auth] Login successful, returning user object.");
          return {
            id: String(data.id),
            name: data.name,
            email: data.email,
            role: data.role,
            roles: data.roles ?? [],
            permissions: data.permissions ?? [],
            image: data.image,
            lastLogin: data.lastLogin,
            referralCode: data.referralCode,
            accessToken: data.accessToken,
            username: data.username,
            needsUsername: data.needsUsername ?? false,
          };
        } catch (err) {
          console.error("[Auth] Exception during fetch in authorize callback:", err);
          throw err;
        }
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      async profile(profile) {
        const res = await fetch(
          getApiUrl("/auth/oauth"),
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              provider: "google",
              providerAccountId: profile.sub,
              profile,
            }),
          },
        );

        if (!res.ok) throw new Error("OAuth backend error");
        const user = await res.json();

        return {
          id: String(user.id),
          name: user.name,
          email: user.email,
          role: user.role,
          roles: user.roles ?? [],
          permissions: user.permissions ?? [],
          image: user.image,
          lastLogin: user.lastLogin,
          referralCode: user.referralCode,
          accessToken: user.accessToken,
          username: user.username,
          needsUsername: user.needsUsername ?? false,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 60 * 60,
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = String(user.id);
        token.role = user.role;
        token.roles = user.roles ?? [];
        token.permissions = user.permissions ?? [];
        token.image = user.image;
        token.lastLogin = user.lastLogin;
        token.email = user.email;
        token.referralCode = user.referralCode;
        token.accessToken = user.accessToken;
        token.username = user.username;
        token.needsUsername = user.needsUsername ?? false;
      }
      // Handle session.update() calls (e.g. after setting a username)
      if (trigger === 'update' && session) {
        if (session.needsUsername !== undefined) token.needsUsername = session.needsUsername;
        if (session.username !== undefined) token.username = session.username;
        if (session.accessToken !== undefined) token.accessToken = session.accessToken;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.roles = (token.roles ?? []) as string[];
        session.user.permissions = (token.permissions ?? []) as string[];
        session.user.image = token.image as string;
        session.user.lastLogin = token.lastLogin as string;
        session.user.email = token.email as string;
        session.user.referralCode = token.referralCode as string;
        session.user.username = token.username as string;
        session.user.needsUsername = token.needsUsername as boolean;
      }
      (session as any).accessToken = token.accessToken as string;
      return session;
    },
  },
  pages: {
    signIn: "/auth",
  },
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-authjs.session-token"
          : "authjs.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        // Omit domain by default so the cookie is scoped to the actual frontend
        // host (including Render/Vercel preview domains). Set it explicitly only
        // when sessions must be shared by multiple skarion.com subdomains.
        ...(cookieDomain ? { domain: cookieDomain } : {}),
      },
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true, //TODO: update later
});
