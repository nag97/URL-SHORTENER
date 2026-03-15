import Header from "@/components/header";
import { Outlet } from "react-router-dom";

const AppLayout = () => {
  return (
  <div style={{ background: "#000000", minHeight: "100vh" }}>
      <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px" }}>
        <Header />
        <Outlet />
      </main>
      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.06)",
          padding: "24px",
          textAlign: "center",
          color: "#4A5568",
          fontSize: "14px",
          fontFamily: "'Space Grotesk', sans-serif",
          marginTop: "40px",
        }}
      >
        © 2026 Shortify — All rights reserved
      </div>
    </div>
  );
};

export default AppLayout;