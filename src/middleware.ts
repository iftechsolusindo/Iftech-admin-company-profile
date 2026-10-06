import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const authUser =
    request.cookies.get("auth-user")?.value;

  /*
   * ==============================
   * LOGIN PAGE
   * ==============================
   *
   * /auth/login bisa diakses
   * tanpa authentication.
   */
  if (pathname === "/auth/login") {
    /*
     * Jika user sudah login tetapi
     * membuka halaman login,
     * arahkan kembali ke dashboard.
     */
    if (authUser) {
      return NextResponse.redirect(
        new URL("/main", request.url)
      );
    }

    return NextResponse.next();
  }

  /*
   * ==============================
   * LOGIN API
   * ==============================
   *
   * Endpoint login harus bisa
   * diakses walaupun user belum
   * memiliki cookie auth-user.
   */
  if (pathname === "/api/auth/login") {
    return NextResponse.next();
  }

  /*
   * ==============================
   * PROTECTED ROUTES
   * ==============================
   *
   * Semua route selain login
   * membutuhkan authentication.
   */
  if (!authUser) {
    return NextResponse.redirect(
      new URL("/auth/login", request.url)
    );
  }

  /*
   * User sudah login.
   * Izinkan request dilanjutkan.
   */
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Jalankan middleware pada semua route
     * kecuali:
     *
     * - _next/static
     * - _next/image
     * - favicon.ico
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};