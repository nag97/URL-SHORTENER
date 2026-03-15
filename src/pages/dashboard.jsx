import { useEffect, useState } from "react";
import { BarLoader } from "react-spinners";
import { Filter } from "lucide-react";
import { useSearchParams } from "react-router-dom";

import { Input } from "@/components/ui/input";
import { CreateLink } from "@/components/create-link";
import LinkCard from "@/components/link-card";
import Error from "@/components/error";

import { getUrls } from "@/db/apiUrls";
import { getClicksForUrls } from "@/db/apiClicks";
import { UrlState } from "@/context";

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchParams] = useSearchParams();
  const longLink = searchParams.get("createNew");

  const { user } = UrlState();

  const [urls, setUrls] = useState([]);
  const [clicks, setClicks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUrls = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getUrls(user.id);
      setUrls(data || []);
      if (data?.length) {
        const clickData = await getClicksForUrls(data.map((u) => u.id));
        setClicks(clickData || []);
      } else {
        setClicks([]);
      }
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUrls();
  }, []);

  const filteredUrls = urls.filter((url) =>
    url.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ padding: "32px 0", display: "flex", flexDirection: "column", gap: "24px" }}>
      {loading && <BarLoader width={"100%"} color="#00C896" />}

      {/* Stats cards */}
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

      {/* Header row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: "32px", fontWeight: "800", color: "#F0F4FF" }}>
          My Links
        </h1>
        <CreateLink fetchUrls={fetchUrls} longLink={longLink} />
      </div>

      {/* Filter */}
      <div style={{ position: "relative" }}>
        <Input
          type="text"
          placeholder="Filter Links..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            background: "#111111",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "10px",
            color: "#F0F4FF",
            padding: "12px 40px 12px 16px",
            fontFamily: "'Space Grotesk', sans-serif",
          }}
        />
        <Filter
          size={16}
          style={{ position: "absolute", top: "50%", right: "14px", transform: "translateY(-50%)", color: "#4A5568" }}
        />
      </div>

      {error && <p style={{ color: "#FF6B6B" }}>{error?.message}</p>}

      {/* Link cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {filteredUrls.map((url, i) => (
          <LinkCard key={i} url={url} fetchUrls={fetchUrls} />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;