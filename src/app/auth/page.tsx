"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Logo } from "@/components/Logo"

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
    <div className="min-h-screen bg-black flex flex-col">
      <nav className="px-6 h-16 flex items-center border-b border-[#00ff41]/15">
        <Logo size="md" />
      </nav>

      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-[380px] border border-[#00ff41]/20 rounded-lg bg-[#0a0a0a] overflow-hidden">
          <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-[#00ff41]/15 bg-[#00ff41]/5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
            <span className="text-[11px] text-[#00b32d] ml-2">
              {isLogin ? "auth/login.sh" : "auth/signup.sh"}
            </span>
          </div>

          <div className="p-7">
            <p className="text-[#00b32d] text-[13px] mb-6">
              $ {isLogin ? "./sign-in" : "./create-account"}
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] text-[#00b32d] tracking-wide">EMAIL</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="bg-black border border-[#00ff41]/20 rounded px-3 py-2.5 text-[14px] text-white placeholder:text-white/20 focus:outline-none focus:border-[#00ff41]/60 transition-colors"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] text-[#00b32d] tracking-wide">PASSWORD</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="bg-black border border-[#00ff41]/20 rounded px-3 py-2.5 text-[14px] text-white placeholder:text-white/20 focus:outline-none focus:border-[#00ff41]/60 transition-colors"
                  required
                />
              </div>

              {error && (
                <p className="text-[#ff5f56] text-[12px] bg-[#ff5f56]/10 border border-[#ff5f56]/20 rounded px-3 py-2">
                  error: {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="bg-[#00ff41] text-black font-semibold py-2.5 rounded text-[14px] hover:bg-[#00e63b] transition-colors disabled:opacity-50 mt-1"
              >
                {loading ? "processing..." : isLogin ? "sign_in →" : "create_account →"}
              </button>
            </form>

            <p className="mt-6 text-center text-[12px] text-[#00b32d]">
              {isLogin ? "no account?" : "have an account?"}{" "}
              <button
                onClick={() => { setIsLogin(!isLogin); setError("") }}
                className="text-[#00ff41] hover:underline"
              >
                {isLogin ? "sign_up" : "sign_in"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
