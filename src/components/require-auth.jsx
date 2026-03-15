/* eslint-disable react/prop-types */

import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { UrlState } from "@/context";
import { BarLoader } from "react-spinners";

function RequireAuth({ children }) {
  const navigate = useNavigate();
  const { loading, user } = UrlState();

  useEffect(() => {
    // Only redirect if user is not present and not loading
    if (!user && loading === false) navigate("/auth");
  }, [user, loading]);

  if (loading) return <BarLoader width={"100%"} color="#36d7b7" />;
  if (user) return children;
  return null;
}

export default RequireAuth;
