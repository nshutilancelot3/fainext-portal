/* ==========================================================================
   dashboard.js - greeting, summary cards, spending chart, recent activity
   Depends on auth.js (session helpers) and data.js (sample data + formatters).
   ========================================================================== */

/* --- Greeting based on the time of day ----------------------------------- */
function greetingForHour(hour) {
  if (hour < 12) { return "Good morning"; }
  if (hour < 18) { return "Good afternoon"; }
  return "Good evening";
}

/* First word of the full name, used in the greeting. */
function firstName(fullName) {
  return String(fullName || "").trim().split(/\s+/)[0] || "there";
}

/* Long date for the sub-heading, e.g. "Thursday, 08 October 2026". */
function formatLongDate(date) {
  var days = ["Sunday", "Monday", "Tuesday", "Wednesday",
              "Thursday", "Friday", "Saturday"];
  var months = ["January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"];
  return days[date.getDay()] + ", " +
         String(date.getDate()).padStart(2, "0") + " " +
         months[date.getMonth()] + " " +
         date.getFullYear();
}

/* ==========================================================================
   Boot
   ========================================================================== */
document.addEventListener("DOMContentLoaded", function () {
  // Page guard: no session means straight back to the login page
  var session = requireLogin();
  if (!session) { return; }

  initAppShell(session);

  // Greeting + today's date
  var now = new Date();
  document.getElementById("greeting").textContent =
    greetingForHour(now.getHours()) + ", " + firstName(session.fullName);
  document.getElementById("today-date").textContent = formatLongDate(now);

  // Data-driven sections
  renderSummary(FAINEXT_TRANSACTIONS);
  renderChart(FAINEXT_TRANSACTIONS);
  renderRecentActivity(FAINEXT_TRANSACTIONS);
  initQuickActions();
});
