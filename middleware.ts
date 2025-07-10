import { getSessionCookie } from "better-auth/cookies";
import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
	const sessionCookie = getSessionCookie(request);
	const { pathname } = request.nextUrl;

	// If user is authenticated and trying to access the home page, redirect to dashboard
	if (sessionCookie && pathname === "/") {
		return NextResponse.redirect(new URL("/dashboard", request.url));
	}

	// If user is not authenticated and trying to access dashboard, redirect to home
	if (!sessionCookie && pathname === "/dashboard") {
		return NextResponse.redirect(new URL("/", request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/", "/dashboard"], // Specify the routes the middleware applies to
};
