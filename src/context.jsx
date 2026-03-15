/* eslint-disable react/prop-types */

import { createContext, useContext, useEffect } from "react";
import { getCurrentUser } from "../URL-SHORTENER/apiAuth";
import useFetch from "./hooks/use-fetch";

const UrlContext = createContext();

const UrlProvider = ({ children }) => {
  const { data: user, loading, fn: fetchUser } = useFetch(getCurrentUser);

  // User is authenticated if they have an id (they exist in localStorage)
  const isAuthenticated = user && user.id;

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <UrlContext.Provider value={{ user, fetchUser, loading, isAuthenticated }}>
      {children}
    </UrlContext.Provider>
  );
};

export const UrlState = () => {
  return useContext(UrlContext);
};

export default UrlProvider;
