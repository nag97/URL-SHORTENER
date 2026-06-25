import Link from "next/link"

export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: { text: "text-[15px]", arrow: "text-[10px]" },
    md: { text: "text-[19px]", arrow: "text-[11px]" },
    lg: { text: "text-[32px]", arrow: "text-[15px]" },
  }
  const s = sizes[size]

  return (
    <Link href="/" className="inline-flex flex-col items-start group">
      <span className={`font-bold tracking-tight text-[#00ff41] ${s.text}`}>
        cachelink<span className="text-[#00ff41]/40 cursor-blink">_</span>
      </span>
      <span className={`${s.arrow} text-[#00b32d] tracking-widest flex items-center gap-1 -mt-0.5 opacity-70 group-hover:opacity-100 transition-opacity`}>
        <span className="inline-block group-hover:translate-x-0.5 transition-transform">↳</span> redirect.exe
      </span>
    </Link>
  )
}
