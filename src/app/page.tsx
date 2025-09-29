'use client'
import dynamic from 'next/dynamic'

const C1ChatWrapper = dynamic(() => import('../components/C1ChatWrapper'), {
  ssr: false,
})

export default function Home() {
  return (
    <div className="space-y-8">
      <C1ChatWrapper />
    </div>
  )
}
