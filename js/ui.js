/* ==========================================================================
   ui.js - shared app-shell behaviour for the dashboard and transactions pages
   Three things live here:
     1. the light/dark theme toggle
     2. the transaction detail dialog
     3. the printable account statement
   Depends on data.js (formatters, FAINEXT_TRANSACTIONS).
   ========================================================================== */

/* ==========================================================================
   1. THEME
   The theme is written to <html data-theme="..."> and the stylesheet swaps
   its colour tokens off that attribute. index.html and the other pages set
   the attribute inline in <head> too, so there is no white flash on load.
   ========================================================================== */
var THEME_KEY = "fainext_theme";

function storedTheme() {
  try {
    var value = localStorage.getItem(THEME_KEY);
    return value === "dark" || value === "light" ? value : null;
  } catch (e) {
    return null;
  }
}

/* Saved choice first, otherwise follow the operating system setting. */
function preferredTheme() {
  var saved = storedTheme();
  if (saved) { return saved; }

  var query = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)");
  return query && query.matches ? "dark" : "light";
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);

  var button = document.getElementById("theme-btn");
  if (button) {
    var goingDark = theme === "light";
    button.textContent = goingDark ? "Dark" : "Light";
    button.setAttribute("aria-label",
      goingDark ? "Switch to dark mode" : "Switch to light mode");
    button.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
  }
}

function initTheme() {
  applyTheme(preferredTheme());

  var button = document.getElementById("theme-btn");
  if (!button) { return; }

  button.addEventListener("click", function () {
    var next = document.documentElement.getAttribute("data-theme") === "dark"
      ? "light"
      : "dark";
    applyTheme(next);
    try { localStorage.setItem(THEME_KEY, next); } catch (e) { /* ignore */ }
  });
}

/* ==========================================================================
   2. TRANSACTION DETAIL DIALOG
   The markup is injected once at boot so both pages share one copy, and any
   table row rendered by buildTransactionRow() can open it.
   ========================================================================== */

/* Element that had focus before the dialog opened, so we can restore it. */
var modalReturnFocus = null;

function buildModalShell() {
  if (document.getElementById("tx-modal")) { return; }

  var overlay = document.createElement("div");
  overlay.id = "tx-modal";
  overlay.className = "modal";
  overlay.hidden = true;
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-labelledby", "tx-modal-title");

  overlay.innerHTML =
    '<div class="modal-box">' +
      '<div class="modal-head">' +
        '<h2 id="tx-modal-title">Transaction detail</h2>' +
        '<button type="button" class="modal-close" id="tx-modal-close" ' +
                'aria-label="Close dialog">&times;</button>' +
      '</div>' +
      '<dl class="detail-list" id="tx-modal-body"></dl>' +
      '<p class="modal-note">' +
        'Reference numbers can be quoted to Fainext support when querying a payment.' +
      '</p>' +
    '</div>';

  document.body.appendChild(overlay);

  /* Backdrop click closes, clicks inside the white box do not. */
  overlay.addEventListener("click", function (event) {
    if (event.target === overlay) { closeTransactionModal(); }
  });
  document.getElementById("tx-modal-close")
          .addEventListener("click", closeTransactionModal);
}

/* One <dt>/<dd> pair in the detail list. */
function appendDetail(list, label, value, valueClass) {
  var dt = document.createElement("dt");
  dt.textContent = label;

  var dd = document.createElement("dd");
  dd.textContent = value;
  if (valueClass) { dd.className = valueClass; }

  list.appendChild(dt);
  list.appendChild(dd);
}

function openTransactionModal(transaction) {
  buildModalShell();

  var body = document.getElementById("tx-modal-body");
  body.innerHTML = "";

  appendDetail(body, "Reference", transaction.reference);
  appendDetail(body, "Date", formatDisplayDate(transaction.date));
  appendDetail(body, "Description", transaction.description);
  appendDetail(body, "Category", transaction.category);
  appendDetail(body, "Direction", transaction.type === "in" ? "Money In" : "Money Out");
  appendDetail(body, "Method", transaction.method);
  appendDetail(body, "Status", transaction.status);
  appendDetail(
    body,
    "Amount",
    (transaction.type === "in" ? "+" : "-") + formatRWF(transaction.amount),
    transaction.type === "in" ? "amount-in" : "amount-out"
  );

  modalReturnFocus = document.activeElement;

  var overlay = document.getElementById("tx-modal");
  overlay.hidden = false;
  document.body.classList.add("modal-open");
  document.getElementById("tx-modal-close").focus();
}

function closeTransactionModal() {
  var overlay = document.getElementById("tx-modal");
  if (!overlay || overlay.hidden) { return; }

  overlay.hidden = true;
  document.body.classList.remove("modal-open");

  // Send focus back to the row the user came from
  if (modalReturnFocus && modalReturnFocus.focus) { modalReturnFocus.focus(); }
  modalReturnFocus = null;
}

/* Delegated row handling, so rows re-rendered by a filter keep working.
   `container` is the <table> or <tbody> holding the clickable rows. */
function initRowDetails(container) {
  if (!container) { return; }

  function openFromRow(row) {
    var id = Number(row.getAttribute("data-tx-id"));
    for (var i = 0; i < FAINEXT_TRANSACTIONS.length; i++) {
      if (FAINEXT_TRANSACTIONS[i].id === id) {
        openTransactionModal(FAINEXT_TRANSACTIONS[i]);
        return;
      }
    }
  }

  /* Walk up from whatever was clicked to the row that owns it. */
  function rowFromEvent(event) {
    var node = event.target;
    while (node && node !== container) {
      if (node.classList && node.classList.contains("row-clickable")) { return node; }
      node = node.parentNode;
    }
    return null;
  }

  container.addEventListener("click", function (event) {
    var row = rowFromEvent(event);
    if (row) { openFromRow(row); }
  });

  // Keyboard parity: Enter or Space on a focused row
  container.addEventListener("keydown", function (event) {
    if (event.key !== "Enter" && event.key !== " ") { return; }
    var row = rowFromEvent(event);
    if (!row) { return; }
    event.preventDefault();
    openFromRow(row);
  });
}

/* Escape closes the dialog from anywhere on the page. */
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") { closeTransactionModal(); }
});

/* ==========================================================================
   3. PRINTABLE STATEMENT
   Builds a clean statement off-screen, then hands it to the browser's own
   print dialog - which is also how the user saves it as a PDF. No library.
   ========================================================================== */
/* The statement is assembled as an HTML string, so anything that came from a
   registration form is escaped before it goes anywhere near innerHTML. */
function escapeHTML(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildStatement(session, transactions) {
  var summary = calculateSummary(transactions);
  var rows = transactions.slice(0, 20);

  var area = document.getElementById("print-area");
  if (!area) {
    area = document.createElement("div");
    area.id = "print-area";
    document.body.appendChild(area);
  }

  var html =
    '<div class="statement">' +
      '<div class="statement-head">' +
        '<div><strong class="statement-brand">Fainext</strong>' +
        '<div class="statement-sub">Account statement</div></div>' +
        '<div class="statement-meta">' +
          '<div>Issued ' + formatDisplayDate(toISODate(new Date())) + '</div>' +
          '<div>Last 20 transactions</div>' +
        '</div>' +
      '</div>' +

      '<table class="statement-holder"><tbody>' +
        '<tr><th>Account holder</th><td>' + escapeHTML(session.fullName) + '</td></tr>' +
        '<tr><th>Email</th><td>' + escapeHTML(session.email) + '</td></tr>' +
        '<tr><th>Phone</th><td>' + escapeHTML(session.phone || "-") + '</td></tr>' +
        '<tr><th>Closing balance</th><td>' + formatRWF(summary.balance) + '</td></tr>' +
        '<tr><th>Money in (this month)</th><td>' + formatRWF(summary.moneyIn) + '</td></tr>' +
        '<tr><th>Money out (this month)</th><td>' + formatRWF(summary.moneyOut) + '</td></tr>' +
      '</tbody></table>' +

      '<table class="statement-rows"><thead><tr>' +
        '<th>Date</th><th>Reference</th><th>Description</th>' +
        '<th>Category</th><th>Method</th><th class="num">Amount</th><th>Status</th>' +
      '</tr></thead><tbody>';

  rows.forEach(function (t) {
    html +=
      '<tr>' +
        '<td>' + formatDisplayDate(t.date) + '</td>' +
        '<td>' + escapeHTML(t.reference) + '</td>' +
        '<td>' + escapeHTML(t.description) + '</td>' +
        '<td>' + escapeHTML(t.category) + '</td>' +
        '<td>' + escapeHTML(t.method) + '</td>' +
        '<td class="num">' + (t.type === "in" ? "+" : "-") + formatRWF(t.amount) + '</td>' +
        '<td>' + t.status + '</td>' +
      '</tr>';
  });

  html +=
      '</tbody></table>' +
      '<p class="statement-foot">' +
        'Front-end prototype generated from sample data. Not a legal financial document.' +
      '</p>' +
    '</div>';

  area.innerHTML = html;
}

function printStatement(session, transactions) {
  buildStatement(session, transactions);
  window.print();
}
