import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const auth = req.cookies.get('auth')?.value === 'true'
  const path = req.nextUrl.pathname

  const isProtected =
    path === '/' ||
    path === '/forms' ||
    /^\/forms\/[^/]+\/submissions$/.test(path)

  if (!auth && isProtected) {
    return NextResponse.redirect(new URL('/home', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '', '/forms/:path*/submissions'],
}
