import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Link2, BarChart2, QrCode, Zap } from "lucide-react";

const LandingPage = () => {
  const [longUrl, setLongUrl] = useState("");
  const navigate = useNavigate();

  const handleShorten = (e) => {
    e.preventDefault();
    if (longUrl) navigate(`/auth?createNew=${longUrl}`);
  };

  return (
    <div style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      {/* Hero Section */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "60px",
          padding: "80px 0 60px",
          flexWrap: "wrap",
        }}
      >
        {/* Left — text */}
        <div style={{ flex: "1", minWidth: "280px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(0,200,150,0.1)",
              border: "1px solid rgba(0,200,150,0.3)",
              borderRadius: "100px",
              padding: "6px 14px",
              marginBottom: "24px",
              fontSize: "13px",
              color: "#00C896",
              fontWeight: "600",
            }}
          >
            <Zap size={14} />
            Free URL Shortener
          </div>
          <h1
            style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: "clamp(36px, 5vw, 60px)",
              fontWeight: "800",
              lineHeight: "1.1",
              marginBottom: "20px",
              color: "#F0F4FF",
            }}
          >
            Shorten Links.
            <br />
            <span style={{ color: "#00C896" }}>Track Everything.</span>
          </h1>
          <p
            style={{
              fontSize: "17px",
              color: "#8892AA",
              lineHeight: "1.7",
              marginBottom: "32px",
              maxWidth: "420px",
            }}
          >
            Create short links, generate QR codes, and get detailed analytics
            on every click — all in one place.
          </p>

          {/* Features row */}
          <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
            {[
              { icon: <Link2 size={16} />, label: "Short Links" },
              { icon: <QrCode size={16} />, label: "QR Codes" },
              { icon: <BarChart2 size={16} />, label: "Analytics" },
            ].map((f) => (
              <div
                key={f.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  color: "#8892AA",
                  fontSize: "14px",
                }}
              >
                <span style={{ color: "#00C896" }}>{f.icon}</span>
                {f.label}
              </div>
            ))}
          </div>
        </div>

        {/* Right — form card */}
        <div
          style={{
            flex: "1",
            minWidth: "300px",
            maxWidth: "480px",
            background: "#141B2D",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "20px",
            padding: "36px",
          }}
        >
          <h2
            style={{
              fontSize: "20px",
              fontWeight: "700",
              marginBottom: "8px",
              color: "#F0F4FF",
            }}
          >
            Shorten a Link
          </h2>
          <p style={{ fontSize: "14px", color: "#8892AA", marginBottom: "24px" }}>
            Paste your long URL below to get started
          </p>
          <form onSubmit={handleShorten} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <input
              type="url"
              placeholder="https://your-very-long-url.com/goes-here"
              value={longUrl}
              onChange={(e) => setLongUrl(e.target.value)}
              className="s-input"
              style={{
                background: "#0A0F1E",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "10px",
                color: "#F0F4FF",
                padding: "14px 16px",
                fontSize: "15px",
                width: "100%",
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            />
            <button
              type="submit"
              style={{
                background: "#00C896",
                color: "#0A0F1E",
                fontWeight: "700",
                fontSize: "16px",
                border: "none",
                borderRadius: "10px",
                padding: "14px",
                cursor: "pointer",
                fontFamily: "'Space Grotesk', sans-serif",
                transition: "background 0.2s",
              }}
              onMouseOver={(e) => (e.target.style.background = "#00A47C")}
              onMouseOut={(e) => (e.target.style.background = "#00C896")}
            >
              Shorten Link →
            </button>
          </form>

          {/* Stats row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
              marginTop: "24px",
              paddingTop: "24px",
              borderTop: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            {[
              { value: "10M+", label: "Links Created" },
              { value: "99.9%", label: "Uptime" },
            ].map((s) => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "22px", fontWeight: "700", color: "#00C896" }}>
                  {s.value}
                </div>
                <div style={{ fontSize: "12px", color: "#8892AA", marginTop: "2px" }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div style={{ marginTop: "60px", paddingBottom: "60px" }}>
        <h2
          style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: "28px",
            fontWeight: "800",
            marginBottom: "24px",
            color: "#F0F4FF",
          }}
        >
          Frequently Asked Questions
        </h2>
        <Accordion type="multiple" className="w-full">
          <AccordionItem value="item-1" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
            <AccordionTrigger style={{ color: "#F0F4FF", fontWeight: "600" }}>
              How does Shortify work?
            </AccordionTrigger>
            <AccordionContent style={{ color: "#8892AA" }}>
              Paste your long URL, and Shortify generates a short link instantly.
              When someone visits it, they're redirected to your original URL.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
            <AccordionTrigger style={{ color: "#F0F4FF", fontWeight: "600" }}>
              Do I need an account?
            </AccordionTrigger>
            <AccordionContent style={{ color: "#8892AA" }}>
              Yes — an account lets you manage your links, view analytics, and
              create custom short codes.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
            <AccordionTrigger style={{ color: "#F0F4FF", fontWeight: "600" }}>
              What analytics are available?
            </AccordionTrigger>
            <AccordionContent style={{ color: "#8892AA" }}>
              Track total clicks, device types (mobile/desktop), and location
              data for every shortened link.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
};

export default LandingPage;