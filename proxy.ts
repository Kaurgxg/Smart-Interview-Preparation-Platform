import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

function getRoleFromMetadata(metadata: unknown): 'user' | 'admin' {
  if (
    metadata &&
    typeof metadata === 'object' &&
    'role' in metadata &&
    metadata.role === 'admin'
  ) {
    return 'admin'
  }

  return 'user'
}

export async function proxy(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables in proxy', {
      hasUrl: Boolean(supabaseUrl),
      hasAnonKey: Boolean(supabaseAnonKey),
      pathname: request.nextUrl.pathname,
    })
    return NextResponse.next({ request })
  }

  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  let user = null

  try {
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch (error) {
    console.error('Supabase auth lookup failed in proxy', {
      pathname: request.nextUrl.pathname,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return response
  }
  const pathname = request.nextUrl.pathname

  if (user && (pathname === '/login' || pathname === '/signup')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()
    const dest =
      (profile?.role as 'user' | 'admin' | undefined) ??
      getRoleFromMetadata(user.user_metadata)
    const target = dest === 'admin' ? '/admin' : '/dashboard'
    return NextResponse.redirect(new URL(target, request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
}
