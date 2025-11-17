import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Verifica se o usuário está tentando acessar rotas protegidas
  if (request.nextUrl.pathname.startsWith("/tasks")) {
    const authCookie = request.cookies.get("__auth")?.value;

    if (!authCookie) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    try {
      const authData = JSON.parse(authCookie);
      if (!authData.token) {
        return NextResponse.redirect(new URL("/", request.url));
      }
    } catch {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/tasks/:path*"],
};
