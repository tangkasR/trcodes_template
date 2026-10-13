import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = ["/dashboard"];

const authRoutes = ["/login", "/register", "/forgot-password"];

const isRouteMatch = (pathname: string, routes: string[]): boolean => {
  return routes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
};

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Cookie dibuat oleh API login
  const token = request.cookies.get("auth_token")?.value;

  const isProtectedRoute = isRouteMatch(pathname, protectedRoutes);

  const isAuthRoute = isRouteMatch(pathname, authRoutes);

  // Belum login → halaman yang membutuhkan autentikasi
  if (isProtectedRoute && !token) {
    const loginUrl = new URL("/login", request.url);

    loginUrl.searchParams.set("callbackUrl", `${pathname}${search}`);

    return NextResponse.redirect(loginUrl);
  }

  // Sudah memiliki cookie → halaman utama setelah login
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
