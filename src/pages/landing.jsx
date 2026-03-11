import { Input } from "../components/ui/input";
import { Button, buttonVariants } from "../components/ui/button";

const Landing = () => {
  return (
    <div className="w-full text-white">
      Landing Page
      <h2 className="my-10 sm:my-16 text-3xl sm:text-6xl text-white text-center font-extrabold">
        The only URL shortener you'll ever need👇
      </h2>
      
      <form>
        <Input />
        <Button>Shorten !</Button>
      </form>
      <img src="/public/banner.jpeg" alt="banner" className="w-full my-11 md:px" />
    </div>
  );
};

export default Landing;
