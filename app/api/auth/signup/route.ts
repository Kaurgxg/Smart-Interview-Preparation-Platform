import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import type { UserRole } from '@/lib/auth'

type SignupPayload = {
  email?: string
  password?: string
  fullName?: string
  role?: UserRole
  adminCode?: string
}

export async function POST(request: Request) {
  const { email, password, fullName, role, adminCode } =
    (await request.json()) as SignupPayload

  if (!email || !password || !fullName || !role) {
    return NextResponse.json(
      { error: 'Missing required signup fields.' },
      { status: 400 }
    )
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json(
      { error: 'Supabase is not configured on the server.' },
      { status: 500 }
    )
  }

  const adminSecret =
    process.env.ADMIN_SECRET_CODE ??
    process.env.NEXT_PUBLIC_ADMIN_SECRET_CODE ??
    'ADMIN2024'

  if (role === 'admin' && (!adminCode || adminCode !== adminSecret)) {
    return NextResponse.json(
      { error: 'Invalid admin code. Please contact your administrator.' },
      { status: 403 }
    )
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { role, full_name: fullName },
    },
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ error: null })
}
