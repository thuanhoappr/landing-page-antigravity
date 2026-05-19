import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** Chuyển link PDF cũ sang API tải (VPS standalone không phục vụ /downloads/*.pdf ổn định). */
export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (pathname === "/downloads/Cam-nang-Pickleball-Newbie.pdf") {
    const url = request.nextUrl.clone();
    url.pathname = "/api/download/cam-nang";
    if (!url.search) {
      url.search = search;
    }
    return NextResponse.rewrite(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/downloads/Cam-nang-Pickleball-Newbie.pdf"],
};
