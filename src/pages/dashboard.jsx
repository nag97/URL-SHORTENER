<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
  {[
    { label: "Links Created", value: urls.length },
    { label: "Total Clicks", value: clicks.length },
  ].map((s) => (
    <div
      key={s.label}
      style={{
        background: "#111111",
        border: "1px solid rgba(255,255,255,0.07)",
        borderLeft: "3px solid #00C896",
        borderRadius: "14px",
        padding: "24px",
      }}
    >
      <div style={{ fontSize: "13px", color: "#8892AA", marginBottom: "8px", fontWeight: "500" }}>
        {s.label}
      </div>
      <div style={{ fontSize: "32px", fontWeight: "700", color: "#F0F4FF", fontFamily: "'Syne', sans-serif" }}>
        {s.value}
      </div>
    </div>
  ))}
</div>