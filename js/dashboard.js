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

/* --- Spending by category: horizontal bars ------------------------------ */
function renderCategories(transactions) {
  var list = document.getElementById("category-list");
  var totalLabel = document.getElementById("category-total");
  if (!list) { return; }

  var breakdown = spendingByCategory(transactions, 30);

  if (totalLabel) {
    totalLabel.textContent = formatRWF(breakdown.total) + " in 30 days";
  }

  list.innerHTML = "";

  if (breakdown.rows.length === 0) {
    var none = document.createElement("li");
    none.className = "muted";
    none.textContent = "No spending in the last 30 days.";
    list.appendChild(none);
    return;
  }

  breakdown.rows.forEach(function (row) {
    var item = document.createElement("li");
    item.className = "cat-row";

    var top = document.createElement("div");
    top.className = "cat-row-head";

    var name = document.createElement("span");
    name.className = "cat-name";
    name.textContent = row.name;

    var value = document.createElement("span");
    value.className = "cat-value";
    value.textContent = formatRWF(row.total) + " · " + Math.round(row.share) + "%";

    top.appendChild(name);
    top.appendChild(value);

    var track = document.createElement("div");
    track.className = "cat-track";

    var fill = document.createElement("div");
    fill.className = "cat-fill";
    // Scale against the largest category so the top bar always fills the row
    fill.style.width = (row.total / breakdown.rows[0].total) * 100 + "%";
    track.appendChild(fill);

    item.appendChild(top);
    item.appendChild(track);
    list.appendChild(item);
  });
}

/* --- Automatic insights -------------------------------------------------- */
function renderInsights(transactions) {
  var list = document.getElementById("insight-list");
  if (!list) { return; }

  var insights = buildInsights(transactions);
  list.innerHTML = "";

  insights.forEach(function (insight) {
    var item = document.createElement("li");
    item.className = "insight insight--" + insight.tone;

    var title = document.createElement("strong");
    title.textContent = insight.title;

    var text = document.createElement("span");
    text.textContent = insight.text;

    item.appendChild(title);
    item.appendChild(text);
    list.appendChild(item);
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

/* --- Quick actions -------------------------------------------------------
   "Download Statement" is real: it builds a printable statement and opens
   the browser print dialog, which doubles as Save as PDF. The transfer
   actions stay prototype placeholders - they would need a payments backend.
   ------------------------------------------------------------------------ */
function initQuickActions(session, transactions) {
  var buttons = document.querySelectorAll("[data-action]");

  Array.prototype.forEach.call(buttons, function (button) {
    button.addEventListener("click", function () {
      var action = button.getAttribute("data-action");

      if (action === "Download Statement") {
        hideAlert("action-message");
        printStatement(session, transactions);
        return;
      }

      showAlert("action-message", action + " needs a payments backend - " +
        "not wired up in this prototype.", "info");
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
  initTheme();

  // Greeting + today's date
  var now = new Date();
  document.getElementById("greeting").textContent =
    greetingForHour(now.getHours()) + ", " + firstName(session.fullName);
  document.getElementById("today-date").textContent = formatLongDate(now);

  // Data-driven sections
  renderSummary(FAINEXT_TRANSACTIONS);
  renderChart(FAINEXT_TRANSACTIONS);
  renderCategories(FAINEXT_TRANSACTIONS);
  renderInsights(FAINEXT_TRANSACTIONS);
  renderRecentActivity(FAINEXT_TRANSACTIONS);

  // Interactive panels
  initGoals(session);
  initQuickActions(session, FAINEXT_TRANSACTIONS);
  initRowDetails(document.getElementById("recent-body"));
});
