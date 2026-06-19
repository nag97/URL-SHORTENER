"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function AuthPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLogin, setIsLogin] = useState(true)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setError(error.message); setLoading(false); return }
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) { setError(error.message); setLoading(false); return }
    }

    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <nav className="px-6 h-12 flex items-center border-b border-[#e8e8ed]">
        <Link href="/" className="font-semibold text-[17px] tracking-tight">Shortify</Link>
      </nav>

      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-[380px]">
          <h1 className="text-[32px] font-semibold tracking-tight text-center mb-1">
            {isLogin ? "Sign in" : "Create your account"}
          </h1>
          <p className="text-[#86868b] text-[15px] text-center mb-10">
            {isLogin ? "Welcome back to Shortify" : "Start shortening links in seconds"}
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="bg-[#f5f5f7] border border-transparent rounded-xl px-4 py-3 text-[15px] placeholder:text-[#86868b] focus:outline-none focus:border-[#0071e3] focus:bg-white transition-colors"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="bg-[#f5f5f7] border border-transparent rounded-xl px-4 py-3 text-[15px] placeholder:text-[#86868b] focus:outline-none focus:border-[#0071e3] focus:bg-white transition-colors"
              required
            />

            {error && (
              <p className="text-[#d70015] text-[13px] text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="bg-[#0071e3] text-white font-medium py-3 rounded-xl text-[15px] hover:bg-[#0077ed] transition-colors disabled:opacity-50 mt-1"
            >
              {loading ? "Please wait…" : isLogin ? "Sign in" : "Create account"}
            </button>
          </form>

          <p className="mt-8 text-center text-[13px] text-[#86868b]">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              onClick={() => { setIsLogin(!isLogin); setError("") }}
              className="text-[#0071e3] hover:underline"
            >
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
