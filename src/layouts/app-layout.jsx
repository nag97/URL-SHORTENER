import Header from "../components/header";
import { Outlet } from "react-router-dom";

const AppLayout = () => {
  return (
    <div className="bg-slate-950 min-h-screen flex flex-col w-full">
      <Header />
      <main className="flex-1 w-full">
        <Outlet />
      </main>

      <div className="p-10 text-center bg-slate-900 text-white border-t border-slate-800 w-full">
        Made with ❤️ by Nagaraj
      </div>
    </div>
  );
};

export default AppLayout;
