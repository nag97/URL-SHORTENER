import { Copy, Download, LinkIcon, Trash } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import useFetch from "@/hooks/use-fetch";
import { deleteUrl } from "@/db/apiUrls";
import { BeatLoader } from "react-spinners";

import PropTypes from "prop-types";

const LinkCard = ({ url = {}, fetchUrls }) => {
  // ✅ use shortCode to delete
  const { loading: loadingDelete, fn: fnDelete } = useFetch(
    deleteUrl,
    url.shortCode,
  );

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

  return (
    <div className="flex flex-col md:flex-row gap-5 border p-4 bg-gray-900 rounded-lg">
      {url?.qr && (
        <img
          src={url.qr}
          className="h-32 object-contain ring ring-blue-500 self-start"
          alt="qr code"
        />
      )}
      {/* ✅ navigate to link page by id */}
      <Link to={`/link/${url?.id}`} className="flex flex-col flex-1">
        <span className="text-3xl font-extrabold hover:underline cursor-pointer">
          {url?.title}
        </span>
        {/* ✅ fixed field names + localhost URL */}
        <span className="text-2xl text-blue-400 font-bold hover:underline cursor-pointer">
          {fullShortUrl}
        </span>
        <span className="flex items-center gap-1 hover:underline cursor-pointer">
          <LinkIcon className="p-1" />
          {url?.originalUrl}
        </span>
        <span className="flex items-end font-extralight text-sm flex-1">
          {url?.createdAt ? new Date(url.createdAt).toLocaleString() : ""}
        </span>
      </Link>
      <div className="flex gap-2">
        <Button
          variant="ghost"
          onClick={() => navigator.clipboard.writeText(fullShortUrl)}
        >
          <Copy />
        </Button>
        <Button variant="ghost" onClick={downloadImage}>
          <Download />
        </Button>
        <Button
          variant="ghost"
          onClick={() => fnDelete().then(() => fetchUrls())}
          disabled={loadingDelete} // ✅ fixed typo
        >
          {loadingDelete ? <BeatLoader size={5} color="white" /> : <Trash />}
        </Button>
      </div>
    </div>
  );
};

export default LinkCard;

LinkCard.propTypes = {
  url: PropTypes.object,
  fetchUrls: PropTypes.func,
};
