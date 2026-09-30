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
