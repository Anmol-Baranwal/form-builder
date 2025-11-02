import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import FormsListPage from '@/components/FormsListPage'

export default async function FormsPage() {
  const isAuth = (await cookies()).get('auth')?.value === 'true'
  if (!isAuth) redirect('/home')
  return <FormsListPage />
}
