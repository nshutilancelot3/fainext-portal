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

/* --- Summary cards ------------------------------------------------------- */
function renderSummary(transactions) {
  var summary = calculateSummary(transactions);

  document.getElementById("stat-balance").textContent = formatRWF(summary.balance);
  document.getElementById("stat-in").textContent = formatRWF(summary.moneyIn);
  document.getElementById("stat-out").textContent = formatRWF(summary.moneyOut);
  document.getElementById("stat-count").textContent = String(summary.count);

  // Current month name on the two "this month" cards
  var monthNames = ["January", "February", "March", "April", "May", "June",
                    "July", "August", "September", "October", "November", "December"];
  var monthName = monthNames[new Date().getMonth()];
  var notes = document.querySelectorAll(".js-month-name");
  Array.prototype.forEach.call(notes, function (node) {
    node.textContent = monthName;
  });
}

/* --- Spending bar chart (plain divs, no chart library) ------------------- */
function renderChart(transactions) {
  var container = document.getElementById("chart");
  if (!container) { return; }

  var buckets = monthlySpending(transactions);
  var max = buckets.reduce(function (highest, b) {
    return Math.max(highest, b.total);
  }, 0);

  container.innerHTML = "";

  buckets.forEach(function (bucket) {
    // Bar height as a percentage of the tallest bar (min 4% so empty months show)
    var percent = max > 0 ? Math.max(4, Math.round((bucket.total / max) * 100)) : 4;

    var col = document.createElement("div");
    col.className = "chart-col";
    col.title = bucket.label + ": " + formatRWF(bucket.total);

    var amount = document.createElement("span");
    amount.className = "chart-amount";
    // Compact label, e.g. "318K"
    amount.textContent = bucket.total >= 1000
      ? Math.round(bucket.total / 1000) + "K"
      : String(bucket.total);

    var bar = document.createElement("div");
    bar.className = "chart-bar";
    bar.style.height = percent + "%";

    var label = document.createElement("span");
    label.className = "chart-label";
    label.textContent = bucket.label;

    col.appendChild(amount);
    col.appendChild(bar);
    col.appendChild(label);
    container.appendChild(col);
  });
}

/* --- Recent activity: 5 latest transactions ----------------------------- */
function renderRecentActivity(transactions) {
  var body = document.getElementById("recent-body");
  if (!body) { return; }

  body.innerHTML = "";
  transactions.slice(0, 5).forEach(function (t) {
    body.appendChild(buildTransactionRow(t, { reference: false, method: false }));
  });
}

/* --- Quick actions: prototype "Coming soon" feedback -------------------- */
function initQuickActions() {
  var buttons = document.querySelectorAll("[data-action]");
  Array.prototype.forEach.call(buttons, function (button) {
    button.addEventListener("click", function () {
      showAlert("action-message",
        button.getAttribute("data-action") + " is coming soon.", "info");
    });
  });
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
