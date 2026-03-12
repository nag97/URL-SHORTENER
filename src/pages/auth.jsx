import { useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Login from "../components/login";
import Signup from "../components/signup";

const Auth = () => {
  const [searchParams] = useSearchParams();
  return (
    <div className="mt-36 flex flex-col items-center gap-10 text-white">
      <h1 className="text-5xl font-extrabold">
        {searchParams.get("createNew")
          ? "Hold up! Let's login first"
          : "Login / Signup"}
      </h1>
      <Tabs defaultValue="login" className="w-[400px] text-white">
        <TabsList className="grid w-full grid-cols-2 !bg-transparent !p-0">
          <TabsTrigger
            value="login"
            className="!text-white !bg-transparent data-[state=active]:!bg-transparent"
          >
            Login
          </TabsTrigger>
          <TabsTrigger
            value="signup"
            className="!text-white !bg-transparent data-[state=active]:!bg-transparent"
          >
            Signup
          </TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <Login />
        </TabsContent>
        <TabsContent value="signup">
          <Signup />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Auth;
