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
  var from = filterInputs.from.value;      /* "" or YYYY-MM-DD */
  var to = filterInputs.to.value;

  return FAINEXT_TRANSACTIONS.filter(function (t) {
    // Search matches description or reference
    if (term) {
      var haystack = (t.description + " " + t.reference).toLowerCase();
      if (haystack.indexOf(term) === -1) { return false; }
    }

    if (type !== "all" && t.type !== type) { return false; }
    if (status !== "all" && t.status !== status) { return false; }

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
    body.appendChild(buildTransactionRow(t, { reference: true, method: true }));
  });

  // Empty state + result counter
  emptyRow.hidden = visibleTransactions.length > 0;
  countLabel.textContent = "Showing " + visibleTransactions.length +
                           " of " + FAINEXT_TRANSACTIONS.length + " transactions";

  // Export is pointless with nothing to export
  document.getElementById("export-btn").disabled = visibleTransactions.length === 0;
}

/* --- Reset all filters --------------------------------------------------- */
function resetFilters() {
  filterInputs.search.value = "";
  filterInputs.type.value = "all";
  filterInputs.status.value = "all";
  filterInputs.from.value = "";
  filterInputs.to.value = "";
  renderTable();
}

/* --- CSV export ---------------------------------------------------------- */

/* Quote a value so commas and quotes inside it stay intact. */
function csvCell(value) {
  var text = String(value == null ? "" : value);
  return '"' + text.replace(/"/g, '""') + '"';
}

function exportCSV() {
  if (visibleTransactions.length === 0) { return; }

  var headers = ["Date", "Reference", "Description", "Type",
                 "Method", "Amount (RWF)", "Status"];

  var lines = [headers.map(csvCell).join(",")];

  visibleTransactions.forEach(function (t) {
    lines.push([
      t.date,
      t.reference,
      t.description,
      t.type === "in" ? "Money In" : "Money Out",
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

  filterInputs = {
    search: document.getElementById("filter-search"),
    type: document.getElementById("filter-type"),
    status: document.getElementById("filter-status"),
    from: document.getElementById("filter-from"),
    to: document.getElementById("filter-to")
  };

  // Every filter re-renders instantly
  filterInputs.search.addEventListener("input", renderTable);
  filterInputs.type.addEventListener("change", renderTable);
  filterInputs.status.addEventListener("change", renderTable);
  filterInputs.from.addEventListener("change", renderTable);
  filterInputs.to.addEventListener("change", renderTable);

  document.getElementById("reset-btn").addEventListener("click", resetFilters);
  document.getElementById("export-btn").addEventListener("click", exportCSV);

  renderTable();
});
