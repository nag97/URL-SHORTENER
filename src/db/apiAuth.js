import {
  signup as localSignup,
  login as localLogin,
  logout as localLogout,
  getCurrentUser as localGetCurrentUser,
} from "../lib/localAuth";

export async function login(options) {
  // Accepts either ({ email, password }) or (email, password)
  if (
    typeof options === "object" &&
    options !== null &&
    "email" in options &&
    "password" in options
  ) {
    return localLogin(options.email, options.password);
  }
  // fallback for direct calls
  return localLogin(...arguments);
}

export async function signup({ email, password }) {
  return localSignup(email, password);
}

export async function getCurrentUser() {
  return localGetCurrentUser();
}

export async function logout() {
  return localLogout();
}
