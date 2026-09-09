/* ==========================================================================
   auth.js - registration, login, session handling and page protection
   DEMO ONLY: accounts live in localStorage. Never use this for real auth.
   ========================================================================== */

/* localStorage keys */
var USERS_KEY = "fainext_users";
var SESSION_KEY = "fainext_session";

/* ==========================================================================
   Storage helpers (wrapped so a blocked/full localStorage never throws)
   ========================================================================== */
function getUsers() {
  try {
    var raw = localStorage.getItem(USERS_KEY);
    var parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

function saveUsers(users) {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return true;
  } catch (e) {
    return false;
  }
}

function findUserByEmail(email) {
  var needle = String(email).trim().toLowerCase();
  var users = getUsers();
  for (var i = 0; i < users.length; i++) {
    if (users[i].email === needle) { return users[i]; }
  }
  return null;
}

/* ==========================================================================
   Session helpers - used by the dashboard and transactions pages too
   ========================================================================== */
function setSession(user, remember) {
  var session = {
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    remember: !!remember,
    loggedInAt: new Date().toISOString()
  };
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch (e) { /* ignore - demo only */ }
}

function getSession() {
  try {
    var raw = localStorage.getItem(SESSION_KEY);
    if (!raw) { return null; }
    var session = JSON.parse(raw);
    return (session && session.email) ? session : null;
  } catch (e) {
    return null;
  }
}

function clearSession() {
  try { localStorage.removeItem(SESSION_KEY); } catch (e) { /* ignore */ }
}

/* Redirect to the login page unless somebody is logged in.
   Returns the session so callers can use it straight away. */
function requireLogin() {
  var session = getSession();
  if (!session) {
    window.location.replace("index.html");
    return null;
  }
  return session;
}

/* Initials for the circle avatar, e.g. "Nshuti Lancelot" -> "NL" */
function getInitials(fullName) {
  var parts = String(fullName || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) { return "?"; }
  if (parts.length === 1) { return parts[0].charAt(0).toUpperCase(); }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

