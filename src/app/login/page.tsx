'use client'
import { useState } from 'react'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })

    if (res.ok) {
      window.location.href = '/'
    } else {
      setError('Wrong password')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border border-gray-700 bg-gray-900/60 p-8 shadow-2xl backdrop-blur-md transition-all hover:border-purple-500/50"
      >
        <h2 className="mb-6 text-center text-2xl font-semibold text-white">
          Admin Login
        </h2>
        <div className="mb-4">
          <input
            type="password"
            placeholder="Enter admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-gray-600 bg-gray-800 p-3 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/40 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="w-full cursor-pointer rounded-lg bg-purple-600 py-2.5 font-medium text-white transition-all hover:bg-purple-700 focus:ring-2 focus:ring-purple-500/40"
        >
          Login
        </button>
        {error && (
          <p className="mt-3 text-center text-sm text-red-400">{error}</p>
        )}
      </form>
    </div>
  )
}
