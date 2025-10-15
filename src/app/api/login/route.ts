import { cookies } from 'next/headers'

export async function POST(req: Request) {
  const { password } = await req.json()

  if (password === process.env.ADMIN_PASSWORD) {
    ;(await cookies()).set('auth', 'true', {
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24,
    })

    return Response.json({ ok: true })
  }

  return new Response('Unauthorized', { status: 401 })
}
