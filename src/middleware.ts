import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get("sms_session");
  const path = request.nextUrl.pathname;

  let sessionUser: { id: string; email: string; role: string; fullName: string } | null = null;
  if (sessionCookie?.value) {
    try {
      const [encodedPayload] = sessionCookie.value.split(".");
      if (encodedPayload) {
        // ถอดรหัส base64url payload
        const decodedStr = atob(encodedPayload.replace(/-/g, "+").replace(/_/g, "/"));
        sessionUser = JSON.parse(decodedStr);
      }
    } catch {
      sessionUser = null;
    }
  }

  // ป้องกันการเข้าถึง Protected Routes
  const isProtectedPath = path.startsWith("/admin") || path.startsWith("/teacher") || path.startsWith("/student");
  if (isProtectedPath) {
    if (!sessionUser) {
      return NextResponse.redirect(new URL(`/login?redirect=${encodeURIComponent(path)}`, request.url));
    }

    // Role Guard: ป้องกันไม่ให้ Role อื่นเข้าข้ามโมดูล
    if (path.startsWith("/admin") && sessionUser.role !== "admin") {
      return NextResponse.redirect(new URL(`/${sessionUser.role}`, request.url));
    }
    if (path.startsWith("/teacher") && sessionUser.role !== "teacher") {
      return NextResponse.redirect(new URL(`/${sessionUser.role}`, request.url));
    }
    if (path.startsWith("/student") && sessionUser.role !== "student") {
      return NextResponse.redirect(new URL(`/${sessionUser.role}`, request.url));
    }
  }

  // หากล็อกอินอยู่แล้วและพยายามเข้าหน้า /login ให้ Redirect ไปยัง Dashboard ของตนเอง
  if (path === "/login" && sessionUser) {
    return NextResponse.redirect(new URL(`/${sessionUser.role}`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/teacher/:path*", "/student/:path*", "/login"],
};
