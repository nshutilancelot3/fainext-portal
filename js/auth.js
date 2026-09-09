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

/* ==========================================================================
   Password hashing - SHA-256 through the Web Crypto API
   A small fallback keeps the demo working where crypto.subtle is unavailable
   (for example some browsers on a plain file:// page).
   ========================================================================== */
function hashPassword(password) {
  var hasSubtle = typeof crypto !== "undefined" &&
                  crypto.subtle &&
                  typeof crypto.subtle.digest === "function";

  if (!hasSubtle) {
    return Promise.resolve("fallback$" + simpleHash(password));
  }

  var bytes = new TextEncoder().encode(password);
  return crypto.subtle.digest("SHA-256", bytes)
    .then(function (buffer) {
      return Array.prototype.map
        .call(new Uint8Array(buffer), function (b) {
          return b.toString(16).padStart(2, "0");
        })
        .join("");
    })
    .catch(function () {
      return "fallback$" + simpleHash(password);
    });
}

/* Non-cryptographic fallback (demo safety net, not real security). */
function simpleHash(text) {
  var h1 = 0x811c9dc5, h2 = 0x01000193;
  for (var i = 0; i < text.length; i++) {
    h1 = (h1 ^ text.charCodeAt(i)) * 16777619 >>> 0;
    h2 = (h2 + text.charCodeAt(i) * (i + 7)) >>> 0;
  }
  return h1.toString(16) + h2.toString(16);
}

