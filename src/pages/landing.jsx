import { Input } from "../components/ui/input";
import { Button, buttonVariants } from "../components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const Landing = () => {
  return (
    <div className="flex flex-col items-center text-white px-4 py-10 w-full">
      Landing Page
      <h2 className="my-10 sm:my-16 text-3xl sm:text-6xl text-white text-center font-extrabold">
        The only URL shortener you'll ever need👇
      </h2>
      <form className="sm:h-14 flex flex-col sm:flex-row w-full md:w-2/4 gap-2">
        <Input
          type="url"
          placeholder="Enter a URL to shorten"
          //  onChange = {}
          className="h-full flex-1 py-4 px-4"
        />
        <Button className="h-full" type="submit" variant="destructive">
          Shorten !
        </Button>
      </form>
      <img
        src="/public/banner.jpeg"
        alt="banner"
        className="w-full my-11 md:px-11"
      />
      <Accordion type="multiple" collapsible className="w-full md:px-11">
        <AccordionItem value="item-1">
          <AccordionTrigger>How does the URL shortener work?</AccordionTrigger>
          <AccordionContent>
            The URL shortener takes a long URL and generates a unique, shorter
            URL that redirects to the original URL when accessed. This is
            typically done by creating a hash of the original URL and using it
            as the identifier for the shortened URL.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-2">
          <AccordionTrigger>Do I need to create an account?</AccordionTrigger>
          <AccordionContent>
            Yes, you need to create an account to use our URL shortener. This
            allows us to provide you with a personalized dashboard where you can
            manage your shortened URLs, track their performance, and access
            additional features.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-3">
          <AccordionTrigger>What analytics are available for my shortened URLs?</AccordionTrigger>
          <AccordionContent>
            Our URL shortener provides detailed analytics for each of your shortened URLs, including the number of clicks, geographic location of the clicks, referral sources, and the devices used to access the URLs. You can view these analytics in your dashboard to gain insights into the performance of your shortened URLs.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default Landing;
