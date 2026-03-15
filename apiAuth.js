const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Store token in localStorage
function getToken() {
  return localStorage.getItem("authToken");
}

function setToken(token) {
  if (token) {
    localStorage.setItem("authToken", token);
  } else {
    localStorage.removeItem("authToken");
  }
}

const headers = () => ({
  "Content-Type": "application/json",
  ...(getToken() && { Authorization: `Bearer ${getToken()}` }),
});

export async function login({ email, password }) {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Login failed");
  }

  const data = await res.json();
  setToken(data.token);
  return data.user;
}

export async function signup({ name, email, password, profile_pic }) {
  const res = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password, profile_pic }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Signup failed");
  }

  const data = await res.json();
  setToken(data.token);
  return data.user;
}

export async function getCurrentUser() {
  const token = getToken();
  if (!token) {
    return null;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      method: "GET",
      headers: headers(),
    });

    if (!res.ok) {
      setToken(null);
      return null;
    }

    return await res.json();
  } catch (error) {
    console.error("Get current user error:", error);
    return null;
  }
}

export async function logout() {
  setToken(null);
  return { success: true };
}
