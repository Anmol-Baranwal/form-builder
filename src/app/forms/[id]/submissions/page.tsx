import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import SubmissionsPage from '@/components/SubmissionsPage'

export default async function SubmissionsServerPage() {
  const isAuth = (await cookies()).get('auth')?.value === 'true'
  if (!isAuth) redirect('/home')
  return <SubmissionsPage />
}
