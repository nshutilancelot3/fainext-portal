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

/* ==========================================================================
   Validation rules
   ========================================================================== */
var EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
var RW_PHONE_PATTERN = /^07\d{8}$/;          /* Rwandan mobile: 07 + 8 digits */

function isValidEmail(value) {
  return EMAIL_PATTERN.test(String(value).trim());
}

function isValidRwandanPhone(value) {
  return RW_PHONE_PATTERN.test(String(value).trim());
}

/* Password must be 8+ characters with at least one uppercase letter and one number. */
function checkPasswordRules(password) {
  var value = String(password);
  if (value.length < 8) { return "Password must be at least 8 characters"; }
  if (!/[A-Z]/.test(value)) { return "Password must include 1 uppercase letter"; }
  if (!/[0-9]/.test(value)) { return "Password must include 1 number"; }
  return "";
}

/* Score 0-4 -> weak / medium / strong */
function passwordStrength(password) {
  var value = String(password);
  if (!value) { return { level: "", label: "" }; }

  var score = 0;
  if (value.length >= 8) { score++; }
  if (value.length >= 12) { score++; }
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) { score++; }
  if (/[0-9]/.test(value)) { score++; }
  if (/[^A-Za-z0-9]/.test(value)) { score++; }

  if (score <= 2) { return { level: "weak", label: "Weak password" }; }
  if (score <= 3) { return { level: "medium", label: "Medium strength" }; }
  return { level: "strong", label: "Strong password" };
}

/* ==========================================================================
   Small form UI helpers
   ========================================================================== */

/* Show or clear the red error text under one field. */
function setFieldError(inputId, message) {
  var input = document.getElementById(inputId);
  var error = document.getElementById(inputId + "-error");
  if (error) { error.textContent = message || ""; }
  if (input) {
    if (message) { input.classList.add("invalid"); }
    else { input.classList.remove("invalid"); }
  }
}

/* Show a page-level alert box. */
function showAlert(elementId, message, kind) {
  var box = document.getElementById(elementId);
  if (!box) { return; }
  box.textContent = message;
  box.className = "alert alert--" + (kind || "info");
  box.hidden = false;
}

function hideAlert(elementId) {
  var box = document.getElementById(elementId);
  if (box) { box.hidden = true; box.textContent = ""; }
}

/* Wire up every Show/Hide password button on the page. */
function initPasswordToggles() {
  var buttons = document.querySelectorAll(".toggle-password");
  Array.prototype.forEach.call(buttons, function (button) {
    button.addEventListener("click", function () {
      var input = document.getElementById(button.getAttribute("data-target"));
      if (!input) { return; }
      var hidden = input.type === "password";
      input.type = hidden ? "text" : "password";
      button.textContent = hidden ? "Hide" : "Show";
      button.setAttribute("aria-label", hidden ? "Hide password" : "Show password");
    });
  });
}

/* ==========================================================================
   LOGIN PAGE
   ========================================================================== */
function initLoginPage() {
  var form = document.getElementById("login-form");
  if (!form) { return; }

  // Already signed in? Go straight to the dashboard.
  if (getSession()) {
    window.location.replace("dashboard.html");
    return;
  }

  var emailInput = document.getElementById("login-email");
  var passwordInput = document.getElementById("login-password");
  var rememberInput = document.getElementById("login-remember");
  var submitButton = document.getElementById("login-submit");

  // Pre-fill the email remembered from a previous "Remember me" login.
  try {
    var remembered = localStorage.getItem("fainext_remember_email");
    if (remembered) {
      emailInput.value = remembered;
      rememberInput.checked = true;
    }
  } catch (e) { /* ignore */ }

  // "Forgot password?" - prototype message only, no real reset flow.
  var forgot = document.getElementById("forgot-link");
  if (forgot) {
    forgot.addEventListener("click", function (event) {
      event.preventDefault();
      showAlert("login-alert",
        "Password reset is not available in this prototype. " +
        "Please contact support@fainext.rw.", "info");
    });
  }

  // Clear errors while the user types
  emailInput.addEventListener("input", function () { setFieldError("login-email", ""); });
  passwordInput.addEventListener("input", function () { setFieldError("login-password", ""); });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    hideAlert("login-alert");

    var email = emailInput.value.trim();
    var password = passwordInput.value;
    var valid = true;

    // Field validation
    if (!email) {
      setFieldError("login-email", "Email is required");
      valid = false;
    } else if (!isValidEmail(email)) {
      setFieldError("login-email", "Enter a valid email address");
      valid = false;
    } else {
      setFieldError("login-email", "");
    }

    if (!password) {
      setFieldError("login-password", "Password is required");
      valid = false;
    } else {
      setFieldError("login-password", "");
    }

    if (!valid) { return; }

    // Look the user up and compare password hashes
    submitButton.disabled = true;
    var user = findUserByEmail(email);

    hashPassword(password).then(function (hash) {
      if (!user || user.passwordHash !== hash) {
        submitButton.disabled = false;
        showAlert("login-alert", "Invalid email or password", "error");
        return;
      }

      // Success - store the session and remember the email if asked
      setSession(user, rememberInput.checked);
      try {
        if (rememberInput.checked) {
          localStorage.setItem("fainext_remember_email", user.email);
        } else {
          localStorage.removeItem("fainext_remember_email");
        }
      } catch (e) { /* ignore */ }

      window.location.href = "dashboard.html";
    });
  });
}

/* ==========================================================================
   REGISTRATION PAGE
   ========================================================================== */
function initRegisterPage() {
  var form = document.getElementById("register-form");
  if (!form) { return; }

  var nameInput = document.getElementById("reg-name");
  var emailInput = document.getElementById("reg-email");
  var phoneInput = document.getElementById("reg-phone");
  var passwordInput = document.getElementById("reg-password");
  var confirmInput = document.getElementById("reg-confirm");
  var termsInput = document.getElementById("reg-terms");
  var submitButton = document.getElementById("register-submit");

  var strengthFill = document.getElementById("strength-fill");
  var strengthLabel = document.getElementById("strength-label");

  // Live password strength bar
  passwordInput.addEventListener("input", function () {
    var result = passwordStrength(passwordInput.value);
    strengthFill.className = "strength-fill " + result.level;
    strengthLabel.textContent = result.label;
    setFieldError("reg-password", "");
  });

  // Clear each error as the user corrects the field
  [nameInput, emailInput, phoneInput, confirmInput].forEach(function (input) {
    input.addEventListener("input", function () { setFieldError(input.id, ""); });
  });
  termsInput.addEventListener("change", function () { setFieldError("reg-terms", ""); });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    hideAlert("register-alert");

    var fullName = nameInput.value.trim();
    var email = emailInput.value.trim().toLowerCase();
    var phone = phoneInput.value.trim();
    var password = passwordInput.value;
    var confirm = confirmInput.value;
    var valid = true;

    // Full name
    if (!fullName) {
      setFieldError("reg-name", "Full name is required");
      valid = false;
    } else if (fullName.length < 3) {
      setFieldError("reg-name", "Please enter your full name");
      valid = false;
    } else {
      setFieldError("reg-name", "");
    }

    // Email - format, then "already registered"
    if (!email) {
      setFieldError("reg-email", "Email is required");
      valid = false;
    } else if (!isValidEmail(email)) {
      setFieldError("reg-email", "Enter a valid email address");
      valid = false;
    } else if (findUserByEmail(email)) {
      setFieldError("reg-email", "This email is already registered");
      valid = false;
    } else {
      setFieldError("reg-email", "");
    }

    // Rwandan phone number
    if (!phone) {
      setFieldError("reg-phone", "Phone number is required");
      valid = false;
    } else if (!isValidRwandanPhone(phone)) {
      setFieldError("reg-phone", "Use a Rwandan number: 10 digits starting with 07");
      valid = false;
    } else {
      setFieldError("reg-phone", "");
    }

    // Password rules
    var passwordProblem = password ? checkPasswordRules(password) : "Password is required";
    if (passwordProblem) {
      setFieldError("reg-password", passwordProblem);
      valid = false;
    } else {
      setFieldError("reg-password", "");
    }

    // Confirm password
    if (!confirm) {
      setFieldError("reg-confirm", "Please confirm your password");
      valid = false;
    } else if (confirm !== password) {
      setFieldError("reg-confirm", "Passwords do not match");
      valid = false;
    } else {
      setFieldError("reg-confirm", "");
    }

    // Terms
    if (!termsInput.checked) {
      setFieldError("reg-terms", "You must agree to the terms");
      valid = false;
    } else {
      setFieldError("reg-terms", "");
    }

    if (!valid) { return; }

    // Hash the password, then save the new user
    submitButton.disabled = true;

    hashPassword(password).then(function (hash) {
      var users = getUsers();
      users.push({
        fullName: fullName,
        email: email,
        phone: phone,
        passwordHash: hash,
        createdAt: new Date().toISOString()
      });

      if (!saveUsers(users)) {
        submitButton.disabled = false;
        showAlert("register-alert",
          "Could not save your account. Please enable browser storage.", "error");
        return;
      }

      showAlert("register-alert", "Account created! Redirecting to login...", "success");
      form.reset();
      strengthFill.className = "strength-fill";
      strengthLabel.textContent = "";

      window.setTimeout(function () {
        window.location.href = "index.html";
      }, 2000);
    });
  });
}

/* ==========================================================================
   Navbar shared by the dashboard and transactions pages
   ========================================================================== */
function initAppShell(session) {
  // Avatar initials + name
  var avatar = document.getElementById("nav-avatar");
  var name = document.getElementById("nav-name");
  if (avatar) { avatar.textContent = getInitials(session.fullName); }
  if (name) { name.textContent = session.fullName; }

  // Logout clears the session and returns to the login page
  var logout = document.getElementById("logout-btn");
  if (logout) {
    logout.addEventListener("click", function () {
      clearSession();
      window.location.href = "index.html";
    });
  }
}

/* ==========================================================================
   Boot - each init exits quietly if its page is not the current one
   ========================================================================== */
document.addEventListener("DOMContentLoaded", function () {
  initPasswordToggles();
  initLoginPage();
  initRegisterPage();
});
