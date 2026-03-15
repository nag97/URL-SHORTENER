/* eslint-disable react/prop-types */

import { createContext, useContext, useEffect, useState } from "react";
import { getCurrentUser } from "./db/apiAuth";

const UrlContext = createContext();

const UrlProvider = ({ children }) => {
  // Restore user from localStorage on mount
  const [user, setUser] = useState(() => getCurrentUser());
  const [loading, setLoading] = useState(false);

  // Always use currentUser from localStorage as source of truth
  const fetchUser = () => {
    setLoading(true);
    const u = getCurrentUser();
    setUser(u);
    setLoading(false);
  };

  useEffect(() => {
    fetchUser();
  }, []);

  // Authenticated if user object exists
  const isAuthenticated = !!user;

  return (
    <UrlContext.Provider value={{ user, fetchUser, loading, isAuthenticated }}>
      {children}
    </UrlContext.Provider>
  );
};

export const UrlState = () => useContext(UrlContext);

export default UrlProvider;
