/* ==========================================================================
   transactions.js - full transaction table, combined filters and CSV export
   Depends on auth.js (session helpers), data.js (sample data + formatters)
   and dashboard.js (buildTransactionRow).
   ========================================================================== */

/* Filter inputs, cached on load */
var filterInputs = {};

/* Rows currently visible - also what the CSV export writes out. */
var visibleTransactions = [];

/* --- Apply every filter together ---------------------------------------- */
function filterTransactions() {
  var term = filterInputs.search.value.trim().toLowerCase();
  var type = filterInputs.type.value;      /* all | in | out */
  var status = filterInputs.status.value;  /* all | Completed | Pending | Failed */
  var category = filterInputs.category.value;  /* all | category name */
  var from = filterInputs.from.value;      /* "" or YYYY-MM-DD */
  var to = filterInputs.to.value;

  return FAINEXT_TRANSACTIONS.filter(function (t) {
    // Search matches description, reference or category
    if (term) {
      var haystack = (t.description + " " + t.reference + " " + t.category).toLowerCase();
      if (haystack.indexOf(term) === -1) { return false; }
    }

    if (type !== "all" && t.type !== type) { return false; }
    if (status !== "all" && t.status !== status) { return false; }
    if (category !== "all" && t.category !== category) { return false; }

    // ISO date strings compare correctly as plain strings
    if (from && t.date < from) { return false; }
    if (to && t.date > to) { return false; }

    return true;
  });
}

/* --- Draw the table ------------------------------------------------------ */
function renderTable() {
  var body = document.getElementById("tx-body");
  var emptyRow = document.getElementById("tx-empty");
  var countLabel = document.getElementById("tx-count");

  visibleTransactions = filterTransactions();

  body.innerHTML = "";
  visibleTransactions.forEach(function (t) {
    body.appendChild(buildTransactionRow(t, {
      reference: true,
      method: true,
      category: true
    }));
  });

  // Empty state + result counter
  emptyRow.hidden = visibleTransactions.length > 0;
  countLabel.textContent = "Showing " + visibleTransactions.length +
                           " of " + FAINEXT_TRANSACTIONS.length + " transactions";

  renderFilteredTotals();

  // Export is pointless with nothing to export
  document.getElementById("export-btn").disabled = visibleTransactions.length === 0;
}

/* --- Totals for whatever the filters are currently showing --------------
   Filtering a table is only half the job: the question behind the filter is
   usually "how much", so the answer is shown right under the controls.
   ------------------------------------------------------------------------ */
function renderFilteredTotals() {
  var box = document.getElementById("tx-totals");
  if (!box) { return; }

  if (visibleTransactions.length === 0) {
    box.hidden = true;
    return;
  }

  var moneyIn = 0;
  var moneyOut = 0;

  visibleTransactions.forEach(function (t) {
    if (t.status !== "Completed") { return; }
    if (t.type === "in") { moneyIn += t.amount; } else { moneyOut += t.amount; }
  });

  var net = moneyIn - moneyOut;

  document.getElementById("total-in").textContent = formatRWF(moneyIn);
  document.getElementById("total-out").textContent = formatRWF(moneyOut);

  var netNode = document.getElementById("total-net");
  netNode.textContent = (net < 0 ? "-" : "+") + formatRWF(net);
  netNode.className = "tx-total-value " + (net < 0 ? "amount-out" : "amount-in");

  box.hidden = false;
}

/* --- Reset all filters --------------------------------------------------- */
function resetFilters() {
  filterInputs.search.value = "";
  filterInputs.type.value = "all";
  filterInputs.status.value = "all";
  filterInputs.category.value = "all";
  filterInputs.from.value = "";
  filterInputs.to.value = "";
  renderTable();
}

/* --- Build the category dropdown from the data, not a hardcoded list ---- */
function populateCategoryFilter() {
  var select = filterInputs.category;

  /* Only offer categories that actually occur in the dataset. */
  var present = {};
  FAINEXT_TRANSACTIONS.forEach(function (t) { present[t.category] = true; });

  categoryNames().forEach(function (name) {
    if (!present[name]) { return; }
    var option = document.createElement("option");
    option.value = name;
    option.textContent = name;
    select.appendChild(option);
  });
}

/* --- CSV export ---------------------------------------------------------- */

/* Quote a value so commas and quotes inside it stay intact. */
function csvCell(value) {
  var text = String(value == null ? "" : value);
  return '"' + text.replace(/"/g, '""') + '"';
}

function exportCSV() {
  if (visibleTransactions.length === 0) { return; }

  var headers = ["Date", "Reference", "Description", "Type", "Category",
                 "Method", "Amount (RWF)", "Status"];

  var lines = [headers.map(csvCell).join(",")];

  visibleTransactions.forEach(function (t) {
    lines.push([
      t.date,
      t.reference,
      t.description,
      t.type === "in" ? "Money In" : "Money Out",
      t.category,
      t.method,
      (t.type === "in" ? "" : "-") + t.amount,
      t.status
    ].map(csvCell).join(","));
  });

  // "﻿" byte-order mark keeps accents readable when opened in Excel
  var csv = "﻿" + lines.join("\r\n");
  var blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  var url = URL.createObjectURL(blob);

  var link = document.createElement("a");
  link.href = url;
  link.download = "fainext-transactions-" + toISODate(new Date()) + ".csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Release the blob once the browser has started the download
  window.setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
}

/* ==========================================================================
   Boot
   ========================================================================== */
document.addEventListener("DOMContentLoaded", function () {
  // Page guard
  var session = requireLogin();
  if (!session) { return; }

  initAppShell(session);
  initTheme();

  filterInputs = {
    search: document.getElementById("filter-search"),
    type: document.getElementById("filter-type"),
    status: document.getElementById("filter-status"),
    category: document.getElementById("filter-category"),
    from: document.getElementById("filter-from"),
    to: document.getElementById("filter-to")
  };

  populateCategoryFilter();

  // Every filter re-renders instantly
  filterInputs.search.addEventListener("input", renderTable);
  filterInputs.type.addEventListener("change", renderTable);
  filterInputs.status.addEventListener("change", renderTable);
  filterInputs.category.addEventListener("change", renderTable);
  filterInputs.from.addEventListener("change", renderTable);
  filterInputs.to.addEventListener("change", renderTable);

  document.getElementById("reset-btn").addEventListener("click", resetFilters);
  document.getElementById("export-btn").addEventListener("click", exportCSV);
  document.getElementById("print-btn").addEventListener("click", function () {
    printStatement(session, visibleTransactions);
  });

  // Any row opens the detail dialog
  initRowDetails(document.getElementById("tx-body"));

  renderTable();
});
