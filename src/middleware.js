import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function middleware(request) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // 1. If user is NOT logged in and trying to access anything other than "/", send to login
  if (!user && request.nextUrl.pathname !== '/') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // 2. If user IS logged in, check onboarding status
  if (user) {
    const isOnboardingComplete = user.user_metadata?.onboarding_complete === true

    // If onboarding not done and they aren't already on the onboarding page
    if (!isOnboardingComplete && !request.nextUrl.pathname.startsWith('/onboarding')) {
      return NextResponse.redirect(new URL('/onboarding', request.url))
    }
    
    // Allow users to re-access onboarding to edit their setup if they route there manually.
    // We only force them if they haven't completed it.
  }

  return response
}

// Ensure the middleware runs on the dashboard and onboarding routes
export const config = {
  matcher: ['/', '/onboarding/:path*'],
}