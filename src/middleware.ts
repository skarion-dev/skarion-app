import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;

  const isAuthenticated = !!req.auth;
  const needsUsername = (req.auth?.user as any)?.needsUsername === true;

  // Public paths — always allow
  const publicPaths = ["/auth", "/api/auth"];
  if (publicPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Not logged in → redirect to /auth
  if (!isAuthenticated) {
    return NextResponse.redirect(new URL("/auth", req.url));
  }

  // Logged in but hasn't set a username yet → force to /set-username
  if (needsUsername && pathname !== "/set-username") {
    return NextResponse.redirect(new URL("/set-username", req.url));
  }

  // Already has username but trying to access /set-username → send home
  if (!needsUsername && pathname === "/set-username") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|woff2?|ttf|otf|eot|css|js)$).*)",
  ],
};
