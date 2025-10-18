import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    // Add any additional middleware logic here if needed
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to auth pages and API routes
        if (req.nextUrl.pathname.startsWith('/auth') || 
            req.nextUrl.pathname.startsWith('/api/auth')) {
          return true
        }
        // Require authentication for all other routes
        return !!token
      },
    },
  }
)

// Protect all routes by default and exclude public/auth/static paths
export const config = {
	matcher: [
		"/((?!api|auth|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map)).*)",
	],
}


