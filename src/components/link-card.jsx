import { Copy, Download, LinkIcon, Trash } from "lucide-react";
import { Link } from "react-router-dom";
import useFetch from "@/hooks/use-fetch";
import { deleteUrl } from "@/db/apiUrls";
import { BeatLoader } from "react-spinners";

const LinkCard = ({ url = {}, fetchUrls }) => {
  const { loading: loadingDelete, fn: fnDelete } = useFetch(deleteUrl, url.shortCode);
  const fullShortUrl = `http://localhost:5173/${url?.shortCode}`;

  const downloadImage = () => {
    if (!url?.qr) return;
    const anchor = document.createElement("a");
    anchor.href = url.qr;
    anchor.download = url?.title || "qr-code";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  const iconBtnStyle = {
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "8px",
    color: "#8892AA",
    padding: "8px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "border-color 0.2s, color 0.2s",
  };

  return (
    <div
      style={{
        background: "#111111",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "16px",
        padding: "20px",
        display: "flex",
        flexDirection: "row",
        gap: "20px",
        alignItems: "flex-start",
        transition: "border-color 0.2s",
      }}
      onMouseOver={(e) => e.currentTarget.style.borderColor = "rgba(0,200,150,0.3)"}
      onMouseOut={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"}
    >
      {/* QR */}
      {url?.qr && (
        <div
          style={{
            background: "#fff",
            borderRadius: "10px",
            padding: "6px",
            flexShrink: 0,
          }}
        >
          <img
            src={url.qr}
            style={{ height: "80px", width: "80px", objectFit: "contain", display: "block" }}
            alt="qr code"
          />
        </div>
      )}

      {/* Info */}
      <Link
        to={`/link/${url?.id}`}
        style={{ flex: 1, textDecoration: "none", minWidth: 0 }}
      >
        {/* Title */}
        <div
          style={{
            fontSize: "18px",
            fontWeight: "700",
            color: "#F0F4FF",
            fontFamily: "'Syne', sans-serif",
            marginBottom: "6px",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {url?.title}
        </div>

        {/* Short URL — green */}
        <div
          style={{
            fontSize: "15px",
            fontWeight: "600",
            color: "#00C896",
            marginBottom: "6px",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {fullShortUrl}
        </div>

        {/* Original URL — muted */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            color: "#4A5568",
            fontSize: "13px",
            marginBottom: "8px",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          <LinkIcon size={12} />
          {url?.originalUrl}
        </div>

        {/* Date */}
        {url?.createdAt && (
          <div style={{ fontSize: "12px", color: "#4A5568" }}>
            {new Date(url.createdAt).toLocaleString()}
          </div>
        )}
      </Link>

      {/* Actions */}
      <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
        <button
          style={iconBtnStyle}
          onClick={() => navigator.clipboard.writeText(fullShortUrl)}
          title="Copy"
        >
          <Copy size={16} />
        </button>
        <button style={iconBtnStyle} onClick={downloadImage} title="Download QR">
          <Download size={16} />
        </button>
        <button
          style={{ ...iconBtnStyle, color: "#FF6B6B", borderColor: "rgba(255,107,107,0.2)" }}
          onClick={() => fnDelete().then(() => fetchUrls())}
          disabled={loadingDelete}
          title="Delete"
        >
          {loadingDelete ? <BeatLoader size={4} color="#FF6B6B" /> : <Trash size={16} />}
        </button>
      </div>
    </div>
  );
};

export default LinkCard;