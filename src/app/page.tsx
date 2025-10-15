import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import ClientApp from '@/components/ClientApp'

export default async function Home() {
  const isAuth = (await cookies()).get('auth')?.value === 'true'
  if (!isAuth) redirect('/home')

  return (
    <div className="space-y-8">
      <ClientApp />
    </div>
  )
}
