import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logout } from "@/db/apiAuth";
import useFetch from "@/hooks/use-fetch";
import { Avatar, AvatarFallback } from "@radix-ui/react-avatar";
import { LinkIcon, LogOut, Zap } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { BarLoader } from "react-spinners";
import { UrlState } from "@/context";

const Header = () => {
  const { loading, fn: fnLogout } = useFetch(logout);
  const navigate = useNavigate();
  const { user, fetchUser } = UrlState();
  const userInitial = user?.email?.charAt(0).toUpperCase() || "U";

  return (
    <>
      <nav
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "18px 0",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          marginBottom: "8px",
        }}
      >
        {/* Logo */}
        <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              background: "#00C896",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Zap size={20} color="#0A0F1E" fill="#0A0F1E" />
          </div>
          <span
            style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: "22px",
              fontWeight: "800",
              color: "#F0F4FF",
              letterSpacing: "-0.5px",
            }}
          >
            Shortify
          </span>
        </Link>

        {/* Right side */}
        <div>
          {!user ? (
            <button
              onClick={() => navigate("/auth")}
              style={{
                background: "#00C896",
                color: "#0A0F1E",
                fontWeight: "700",
                fontSize: "14px",
                border: "none",
                borderRadius: "8px",
                padding: "10px 20px",
                cursor: "pointer",
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              Login
            </button>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  style={{
                    width: "38px",
                    height: "38px",
                    borderRadius: "50%",
                    background: "rgba(0,200,150,0.15)",
                    border: "2px solid rgba(0,200,150,0.4)",
                    color: "#00C896",
                    fontWeight: "700",
                    fontSize: "15px",
                    cursor: "pointer",
                    fontFamily: "'Space Grotesk', sans-serif",
                  }}
                >
                  {userInitial}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                style={{
                  background: "#141B2D",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "12px",
                  color: "#F0F4FF",
                  minWidth: "180px",
                }}
              >
                <DropdownMenuLabel style={{ color: "#8892AA", fontSize: "13px" }}>
                  {user?.email}
                </DropdownMenuLabel>
                <DropdownMenuSeparator style={{ background: "rgba(255,255,255,0.06)" }} />
                <DropdownMenuItem style={{ cursor: "pointer" }}>
                  <Link
                    to="/dashboard"
                    style={{ display: "flex", alignItems: "center", color: "#F0F4FF", textDecoration: "none" }}
                  >
                    <LinkIcon size={14} style={{ marginRight: "8px" }} />
                    My Links
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => fnLogout().then(() => { fetchUser(); navigate("/auth"); })}
                  style={{ color: "#FF6B6B", cursor: "pointer" }}
                >
                  <LogOut size={14} style={{ marginRight: "8px" }} />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </nav>
      {loading && <BarLoader width={"100%"} color="#00C896" />}
    </>
  );
};

export default Header;