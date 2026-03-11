import Header from "../components/header";
import { Outlet } from "react-router-dom";

const AppLayout = () => {
  return (
    <div>
      <main  className="min-h-screen container">
        <Header />
        <Outlet />
        {/* footer */}
      </main>

      <div className="p-10 text-center bg-gray-800">
        Made with ❤️ by Nagaraj
      </div>
    </div>
  );
};

export default AppLayout;
