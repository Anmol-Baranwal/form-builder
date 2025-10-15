'use client'
import dynamic from 'next/dynamic'

const C1ChatWrapper = dynamic(() => import('../components/C1ChatWrapper'), {
  ssr: false,
})

export default function ClientApp() {
  return <C1ChatWrapper />
}
