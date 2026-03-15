import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useEffect, useRef, useState } from "react";
import Error from "./error";
import * as yup from "yup";
import { createUrl } from "@/db/apiUrls";
import { BeatLoader } from "react-spinners";
import { QRCode } from "react-qrcode-logo";
import { UrlState } from "@/context";

export function CreateLink({ fetchUrls, longLink }) {
  const { user } = UrlState(); // ✅ use context, not raw localStorage
  const ref = useRef();
  const [open, setOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [formValues, setFormValues] = useState({
    title: "",
    longUrl: longLink || "", // ✅ pre-fill from dashboard param
    customUrl: "",
  });
  const [loading, setLoading] = useState(false);

  // ✅ auto-open dialog if longLink is passed in
  useEffect(() => {
    if (longLink) setOpen(true);
  }, [longLink]);

  const schema = yup.object().shape({
    title: yup.string().required("Title is required"),
    longUrl: yup
      .string()
      .url("Must be a valid URL")
      .required("Long URL is required"),
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
      const canvas = ref.current?.canvasRef?.current;
      let blob = undefined;
      if (canvas) {
        blob = await new Promise((resolve) => canvas.toBlob(resolve));
      }
      const data = {
        ...formValues,
        user_id: user.id, // ✅ from context
      };
      await createUrl(data, blob);
      if (fetchUrls) fetchUrls();
      setOpen(false);
    } catch (e) {
      const newErrors = {};
      if (e?.inner) {
        e.inner.forEach((err) => {
          newErrors[err.path] = err.message;
        });
      } else {
        newErrors.general = e.message || "Unknown error";
      }
      setErrors(newErrors);
      setOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="destructive">Create New Link</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-bold text-2xl">Create New</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          {formValues?.longUrl && (
            <QRCode ref={ref} size={250} value={formValues?.longUrl} />
          )}
          <Input
            id="title"
            placeholder="Short Link's Title"
            value={formValues.title}
            onChange={handleChange}
          />
          {errors.title && <Error message={errors.title} />}
          <Input
            id="longUrl"
            placeholder="Enter your Loooong URL"
            value={formValues.longUrl}
            onChange={handleChange}
          />
          {errors.longUrl && <Error message={errors.longUrl} />}
          <div className="flex items-center gap-2">
            <Card className="p-2">localhost</Card> /
            <Input
              id="customUrl"
              placeholder="Custom Link (optional)"
              value={formValues.customUrl}
              onChange={handleChange}
            />
          </div>
          {errors.general && <Error message={errors.general} />}
          <DialogFooter className="sm:justify-start">
            <Button type="submit" variant="destructive" disabled={loading}>
              {loading ? <BeatLoader size={10} color="white" /> : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}