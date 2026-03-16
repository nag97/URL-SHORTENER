import { storeClicks } from "@/db/apiClicks";
import { getLongUrl } from "@/db/apiUrls";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { BarLoader } from "react-spinners";

const RedirectLink = () => {
  const { id } = useParams();

  useEffect(() => {
    const redirect = async () => {
      try {
        // ✅ get the full url object by shortCode
        const url = await getLongUrl(id);

        console.log("=== REDIRECT DEBUG ===");
        console.log("Short Code (id):", id);
        console.log("Fetched URL object:", url);
        console.log("Original URL value:", url?.originalUrl);
        console.log("=== END DEBUG ===");

        if (!url) {
          console.error("Short URL not found:", id);
          return;
        }

        // ✅ store the click with correct data
        await storeClicks({
          url_id: url.id,
          device: /Mobi|Android/i.test(navigator.userAgent)
            ? "mobile"
            : "desktop",
          country: "Unknown",
        });

        // ✅ redirect to original URL
        console.log("Redirecting to:", url.originalUrl);
        window.location.href = url.originalUrl;
      } catch (e) {
        console.error("Redirect error:", e);
      }
    };

    redirect();
  }, [id]);

  return (
    <>
      <BarLoader width={"100%"} color="#36d7b7" />
      <br />
      Redirecting...
    </>
  );
};

export default RedirectLink;