// Local authentication using localStorage
// No external backend required

/**
 * Generate a simple ID
 */
function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

/**
 * Signup a new user
 */
export async function signup({ name, email, password, profile_pic }) {
  // Validate inputs
  if (!email || !password || !name) {
    throw new Error("Email, password, and name are required");
  }

  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters");
  }

  // Get existing users
  const users = JSON.parse(localStorage.getItem("users") || "[]");

  // Check if user exists
  if (users.find((u) => u.email === email)) {
    throw new Error("User with this email already exists");
  }

  // Create new user
  const newUser = {
    id: generateId(),
    email,
    password, // WARNING: never do this in production! Hash passwords!
    name,
    profile_pic,
    created_at: new Date().toISOString(),
  };

  // Save user
  users.push(newUser);
  localStorage.setItem("users", JSON.stringify(users));

  // Return user data (without password)
  return {
    user: {
      id: newUser.id,
      email: newUser.email,
      user_metadata: {
        name: newUser.name,
        profile_pic: newUser.profile_pic,
      },
    },
  };
}

/**
 * Login user
 */
export async function login({ email, password }) {
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  const users = JSON.parse(localStorage.getItem("users") || "[]");
  const user = users.find((u) => u.email === email && u.password === password);

  if (!user) {
    throw new Error("Invalid email or password");
  }

  // Store current user session
  localStorage.setItem(
    "currentUser",
    JSON.stringify({
      id: user.id,
      email: user.email,
      user_metadata: {
        name: user.name,
        profile_pic: user.profile_pic,
      },
    }),
  );

  return {
    user: {
      id: user.id,
      email: user.email,
      user_metadata: {
        name: user.name,
        profile_pic: user.profile_pic,
      },
    },
  };
}

/**
 * Get current logged in user
 */
export async function getCurrentUser() {
  const currentUser = localStorage.getItem("currentUser");
  if (!currentUser) {
    return null;
  }

  return JSON.parse(currentUser);
}

/**
 * Logout user
 */
export async function logout() {
  localStorage.removeItem("currentUser");
  return { success: true };
}
