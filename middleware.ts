import { NextRequest, NextResponse } from "next/server";

const PUBLIC_ROUTES = ["/login", "/register" ,"/vrTour","/img/1.jpg"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  // If no token and trying to access protected route → redirect to login
  if (!token && !isPublicRoute) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If logged in and trying to access login page → redirect to home
  if (token && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // If logged in and on root → redirect to home
  if (token && pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
 matcher: ["/((?!api|_next/static|_next/image|favicon.ico|img).*)"],
};
