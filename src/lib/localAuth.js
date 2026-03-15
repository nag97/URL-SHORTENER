// Local authentication using localStorage

const USERS_KEY = "users";
const CURRENT_USER_KEY = "currentUser";

function getUsers() {
  return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
}

function setUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function signup(email, password) {
  const users = getUsers();
  if (users.find((u) => u.email === email)) {
    throw new Error("User already exists");
  }
  const id = Date.now().toString();
  const user = { id, email, password };
  users.push(user);
  setUsers(users);
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  return user;
}

function login(email, password) {
  const users = getUsers();
  const user = users.find((u) => u.email === email && u.password === password);
  if (!user) {
    throw new Error("Invalid credentials");
  }
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  return user;
}

function logout() {
  localStorage.removeItem(CURRENT_USER_KEY);
}

function getCurrentUser() {
  return JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
}

export { signup, login, logout, getCurrentUser };
