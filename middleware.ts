export { default } from "next-auth/middleware"

// Protect all routes by default and exclude public/auth/static paths
export const config = {
	matcher: [
		"/((?!api|auth|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map)).*)",
	],
}


