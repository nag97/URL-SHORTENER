import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { useEffect, useRef, useState } from "react";
import * as yup from "yup";
import { createUrl } from "@/db/apiUrls";
import { BeatLoader } from "react-spinners";
import { QRCode } from "react-qrcode-logo";
import { UrlState } from "@/context";
import { Link2, Zap } from "lucide-react";

export function CreateLink({ fetchUrls, longLink }) {
  const { user } = UrlState();
  const qrRef = useRef();
  const [open, setOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [formValues, setFormValues] = useState({
    title: "",
    longUrl: longLink || "",
    customUrl: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (longLink) setOpen(true);
  }, [longLink]);

  const schema = yup.object().shape({
    title: yup.string().required("Title is required"),
    longUrl: yup.string().url("Must be a valid URL").required("Long URL is required"),
    customUrl: yup.string(),
  });

  const handleChange = (e) => {
    setFormValues({ ...formValues, [e.target.id]: e.target.value });
  };

  const handleOpenChange = (val) => {
    setOpen(val);
    if (!val) {
      setFormValues({ title: "", longUrl: longLink || "", customUrl: "" });
      setErrors({});
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      await schema.validate(formValues, { abortEarly: false });
      let blob = undefined;
      if (qrRef.current) {
        const canvas = qrRef.current.querySelector("canvas");
        if (canvas) blob = await new Promise((resolve) => canvas.toBlob(resolve));
      }
      await createUrl({ ...formValues, user_id: user.id }, blob);
      if (fetchUrls) fetchUrls();
      setOpen(false);
    } catch (e) {
      const newErrors = {};
      if (e?.inner) {
        e.inner.forEach((err) => { newErrors[err.path] = err.message; });
      } else {
        newErrors.general = e.message || "Unknown error";
      }
      setErrors(newErrors);
      setOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    background: "#0D0D0D",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "10px",
    color: "#F0F4FF",
    padding: "12px 16px",
    fontSize: "14px",
    width: "100%",
    fontFamily: "'Space Grotesk', sans-serif",
    outline: "none",
    marginBottom: "4px",
  };

  const errorStyle = {
    color: "#FF6B6B",
    fontSize: "12px",
    marginBottom: "8px",
    display: "block",
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button
          style={{
            background: "#00C896",
            color: "#000",
            fontWeight: "700",
            fontSize: "14px",
            border: "none",
            borderRadius: "10px",
            padding: "10px 20px",
            cursor: "pointer",
            fontFamily: "'Space Grotesk', sans-serif",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <Link2 size={16} />
          Create New Link
        </button>
      </DialogTrigger>

      <DialogContent
        style={{
          background: "#111111",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "20px",
          color: "#F0F4FF",
          maxWidth: "480px",
          padding: "32px",
        }}
      >
        <DialogHeader>
          <DialogTitle
            style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: "22px",
              fontWeight: "800",
              color: "#F0F4FF",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                background: "#00C896",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Zap size={18} color="#000" fill="#000" />
            </div>
            Create New Link
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} style={{ marginTop: "20px" }}>
          {/* QR Preview */}
          <div ref={qrRef} style={{ marginBottom: "16px" }}>
            {formValues?.longUrl && (
              <div
                style={{
                  background: "#fff",
                  borderRadius: "12px",
                  padding: "12px",
                  display: "inline-block",
                }}
              >
                <QRCode size={180} value={formValues.longUrl} />
              </div>
            )}
          </div>

          {/* Title */}
          <input
            id="title"
            placeholder="Link Title (e.g. My YouTube Video)"
            value={formValues.title}
            onChange={handleChange}
            style={inputStyle}
          />
          {errors.title && <span style={errorStyle}>{errors.title}</span>}

          {/* Long URL */}
          <input
            id="longUrl"
            placeholder="https://your-long-url.com"
            value={formValues.longUrl}
            onChange={handleChange}
            style={{ ...inputStyle, marginTop: "8px" }}
          />
          {errors.longUrl && <span style={errorStyle}>{errors.longUrl}</span>}

          {/* Custom code */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginTop: "8px",
            }}
          >
            <div
              style={{
                background: "#1A1A1A",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "10px",
                padding: "12px 14px",
                fontSize: "14px",
                color: "#8892AA",
                whiteSpace: "nowrap",
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              localhost /
            </div>
            <input
              id="customUrl"
              placeholder="custom-code (optional)"
              value={formValues.customUrl}
              onChange={handleChange}
              style={{ ...inputStyle, marginBottom: 0 }}
            />
          </div>

          {errors.general && (
            <span style={{ ...errorStyle, marginTop: "8px" }}>{errors.general}</span>
          )}

          <DialogFooter style={{ marginTop: "24px" }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                background: loading ? "#005540" : "#00C896",
                color: "#000",
                fontWeight: "700",
                fontSize: "15px",
                border: "none",
                borderRadius: "10px",
                padding: "13px 28px",
                cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "'Space Grotesk', sans-serif",
                width: "100%",
                transition: "background 0.2s",
              }}
            >
              {loading ? <BeatLoader size={8} color="#000" /> : "Create Link →"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}