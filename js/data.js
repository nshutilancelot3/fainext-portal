/* ==========================================================================
   data.js - sample transaction data + shared helpers
   Loaded by dashboard.js and transactions.js.
   All dates are generated relative to today, so the demo always looks current.
   ========================================================================== */

/* Opening balance used so the demo account shows a realistic positive total. */
var FAINEXT_OPENING_BALANCE = 650000;

/* --- Raw sample rows ------------------------------------------------------
   daysAgo : how many days before today the transaction happened
   type    : "in" (money in) or "out" (money out)
   method  : MTN MoMo | Airtel Money | Bank Transfer | Card
   status  : Completed | Pending | Failed
   -------------------------------------------------------------------------- */
var FAINEXT_RAW_TRANSACTIONS = [
  { daysAgo:   0, description: "MTN MoMo top-up",                type: "out", method: "MTN MoMo",      amount:  20000, status: "Completed" },
  { daysAgo:   1, description: "Supermarket - Simba",            type: "out", method: "Card",          amount:  45500, status: "Completed" },
  { daysAgo:   2, description: "Transfer to Jean Claude",        type: "out", method: "MTN MoMo",      amount:  30000, status: "Completed" },
  { daysAgo:   3, description: "Electricity - REG Cash Power",   type: "out", method: "Airtel Money",  amount:  15000, status: "Completed" },
  { daysAgo:   5, description: "Salary deposit - Fainext Ltd",   type: "in",  method: "Bank Transfer", amount: 450000, status: "Completed" },
  { daysAgo:   6, description: "Internet - MTN",                 type: "out", method: "MTN MoMo",      amount:  25000, status: "Pending"   },
  { daysAgo:   8, description: "Water bill - WASAC",             type: "out", method: "Bank Transfer", amount:  12800, status: "Completed" },
  { daysAgo:  11, description: "Client payment - Kigali Tech Hub", type: "in", method: "Bank Transfer", amount: 180000, status: "Completed" },
  { daysAgo:  14, description: "Moto ride - Yego",               type: "out", method: "MTN MoMo",      amount:   2500, status: "Completed" },
  { daysAgo:  17, description: "Airtel Money withdrawal",        type: "out", method: "Airtel Money",  amount:  50000, status: "Failed"    },
  { daysAgo:  20, description: "Pharmacy - Kigali Pharma",       type: "out", method: "Card",          amount:  18400, status: "Completed" },
  { daysAgo:  23, description: "Transfer to Mukamana Alice",     type: "out", method: "MTN MoMo",      amount:  35000, status: "Completed" },
  { daysAgo:  26, description: "Rent - Kimironko apartment",     type: "out", method: "Bank Transfer", amount: 250000, status: "Completed" },
  { daysAgo:  30, description: "Refund - Kigali Heights store",  type: "in",  method: "Card",          amount:  22000, status: "Completed" },
  { daysAgo:  35, description: "Salary deposit - Fainext Ltd",   type: "in",  method: "Bank Transfer", amount: 450000, status: "Completed" },
  { daysAgo:  38, description: "Electricity - REG Cash Power",   type: "out", method: "MTN MoMo",      amount:  14000, status: "Completed" },
  { daysAgo:  42, description: "Supermarket - Simba",            type: "out", method: "Card",          amount:  62300, status: "Completed" },
  { daysAgo:  47, description: "School fees - Green Hills",      type: "out", method: "Bank Transfer", amount: 150000, status: "Completed" },
  { daysAgo:  52, description: "Internet - MTN",                 type: "out", method: "MTN MoMo",      amount:  25000, status: "Completed" },
  { daysAgo:  58, description: "Freelance project payment",      type: "in",  method: "MTN MoMo",      amount: 120000, status: "Completed" },
  { daysAgo:  65, description: "Salary deposit - Fainext Ltd",   type: "in",  method: "Bank Transfer", amount: 450000, status: "Completed" },
  { daysAgo:  70, description: "Water bill - WASAC",             type: "out", method: "Airtel Money",  amount:  11200, status: "Completed" },
  { daysAgo:  76, description: "Transfer to Jean Claude",        type: "out", method: "MTN MoMo",      amount:  40000, status: "Pending"   },
  { daysAgo:  83, description: "Fuel - SP Nyarugenge",           type: "out", method: "Card",          amount:  32000, status: "Completed" },
  { daysAgo:  92, description: "Salary deposit - Fainext Ltd",   type: "in",  method: "Bank Transfer", amount: 420000, status: "Completed" },
  { daysAgo:  99, description: "RSSB contribution",              type: "out", method: "Bank Transfer", amount:  28000, status: "Completed" },
  { daysAgo: 110, description: "Supermarket - Simba",            type: "out", method: "Card",          amount:  38900, status: "Completed" },
  { daysAgo: 122, description: "Salary deposit - Fainext Ltd",   type: "in",  method: "Bank Transfer", amount: 420000, status: "Completed" },
  { daysAgo: 135, description: "Electricity - REG Cash Power",   type: "out", method: "MTN MoMo",      amount:  16500, status: "Failed"    },
  { daysAgo: 150, description: "Laptop repair - Kigali Computer", type: "out", method: "Card",         amount:  85000, status: "Completed" }
];

/* ==========================================================================
   Spending categories
   Every row is classified automatically from its description, so the user
   never has to tag anything by hand. Money in is always "Income"; money out
   is matched against the keyword list below, in order, first match wins.
   ========================================================================== */
var FAINEXT_CATEGORY_RULES = [
  { name: "Housing & Rent",        keywords: ["rent", "apartment", "landlord"] },
  { name: "Utilities & Bills",     keywords: ["electricity", "cash power", "reg ", "water", "wasac", "internet", "airtime"] },
  { name: "Groceries & Shopping",  keywords: ["supermarket", "simba", "store", "market", "shop"] },
  { name: "Transport",             keywords: ["moto", "ride", "yego", "fuel", "taxi", "bus"] },
  { name: "Health",                keywords: ["pharmacy", "pharma", "clinic", "hospital", "medical"] },
  { name: "Education",             keywords: ["school", "fees", "tuition", "college"] },
  { name: "Savings & Contributions", keywords: ["rssb", "contribution", "savings", "pension"] },
  { name: "Transfers & Cash",      keywords: ["transfer", "withdrawal", "top-up", "topup", "send"] }
];

/* Fallbacks used when nothing in the rule list matches. */
var FAINEXT_INCOME_CATEGORY = "Income";
var FAINEXT_OTHER_CATEGORY = "Other";

/* Pick a category for one raw row. */
function categorise(description, type) {
  if (type === "in") { return FAINEXT_INCOME_CATEGORY; }

  var text = String(description).toLowerCase();

  for (var i = 0; i < FAINEXT_CATEGORY_RULES.length; i++) {
    var rule = FAINEXT_CATEGORY_RULES[i];
    for (var k = 0; k < rule.keywords.length; k++) {
      if (text.indexOf(rule.keywords[k]) !== -1) { return rule.name; }
    }
  }

  return FAINEXT_OTHER_CATEGORY;
}

/* Every category name that can appear, in a stable order for the filter list. */
function categoryNames() {
  var names = [FAINEXT_INCOME_CATEGORY];
  FAINEXT_CATEGORY_RULES.forEach(function (rule) { names.push(rule.name); });
  names.push(FAINEXT_OTHER_CATEGORY);
  return names;
}

/* ==========================================================================
   Date helpers
   ========================================================================== */

/* Today at midnight local time - avoids time-of-day drift in comparisons. */
function todayAtMidnight() {
  var d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/* Format a Date as "YYYY-MM-DD" using local time (toISOString would shift). */
function toISODate(date) {
  var y = date.getFullYear();
  var m = String(date.getMonth() + 1).padStart(2, "0");
  var d = String(date.getDate()).padStart(2, "0");
  return y + "-" + m + "-" + d;
}

/* Friendly display date, e.g. "08 Oct 2026". */
function formatDisplayDate(isoDate) {
  var parts = isoDate.split("-");
  var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return parts[2] + " " + months[Number(parts[1]) - 1] + " " + parts[0];
}

/* ==========================================================================
   Money helper - "RWF 1,250,000"
   ========================================================================== */
function formatRWF(amount) {
  var rounded = Math.round(Math.abs(amount));
  var withCommas = String(rounded).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return "RWF " + withCommas;
}

/* ==========================================================================
   Build the final transaction list (dates + references), newest first
   ========================================================================== */
function buildTransactions() {
  var base = todayAtMidnight();

  var list = FAINEXT_RAW_TRANSACTIONS.map(function (row, index) {
    var d = new Date(base.getTime());
    d.setDate(d.getDate() - row.daysAgo);

    return {
      id: index + 1,
      reference: "FNX-" + (10240 + (FAINEXT_RAW_TRANSACTIONS.length - index) * 7),
      date: toISODate(d),
      description: row.description,
      type: row.type,
      method: row.method,
      amount: row.amount,
      status: row.status,
      category: categorise(row.description, row.type)
    };
  });

  // Newest first; stable tie-break on reference so the order never wobbles.
  list.sort(function (a, b) {
    if (a.date === b.date) { return a.id - b.id; }
    return a.date < b.date ? 1 : -1;
  });

  return list;
}

/* Shared, ready-to-use dataset for both app pages. */
var FAINEXT_TRANSACTIONS = buildTransactions();

/* ==========================================================================
   Summary totals used by the dashboard cards
   ========================================================================== */
function calculateSummary(transactions) {
  var now = todayAtMidnight();
  var thisMonth = now.getMonth();
  var thisYear = now.getFullYear();

  var moneyIn = 0;       // completed money in, current calendar month
  var moneyOut = 0;      // completed money out, current calendar month
  var balance = FAINEXT_OPENING_BALANCE;

  transactions.forEach(function (t) {
    if (t.status !== "Completed") { return; }   // pending/failed never move money

    // Running balance over the whole history
    balance += (t.type === "in" ? t.amount : -t.amount);

    var parts = t.date.split("-");
    var sameMonth = Number(parts[0]) === thisYear && Number(parts[1]) - 1 === thisMonth;

    if (sameMonth) {
      if (t.type === "in") { moneyIn += t.amount; } else { moneyOut += t.amount; }
    }
  });

  return {
    balance: balance,
    moneyIn: moneyIn,
    moneyOut: moneyOut,
    count: transactions.length
  };
}

/* ==========================================================================
   Last 6 months of spending (completed money out) for the CSS bar chart
   ========================================================================== */
function monthlySpending(transactions) {
  var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var now = todayAtMidnight();
  var buckets = [];

  // Build 6 buckets: 5 months ago -> current month
  for (var i = 5; i >= 0; i--) {
    var d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({
      key: d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0"),
      label: months[d.getMonth()],
      total: 0
    });
  }

  transactions.forEach(function (t) {
    if (t.type !== "out" || t.status !== "Completed") { return; }
    var key = t.date.slice(0, 7);
    for (var i = 0; i < buckets.length; i++) {
      if (buckets[i].key === key) { buckets[i].total += t.amount; break; }
    }
  });

  return buckets;
}

/* ==========================================================================
   Spending by category (completed money out, last 30 days by default)
   Returns the biggest category first, each with its share of total spend.
   ========================================================================== */
function spendingByCategory(transactions, dayWindow) {
  var windowDays = dayWindow || 30;
  var cutoff = todayAtMidnight();
  cutoff.setDate(cutoff.getDate() - windowDays);
  var cutoffISO = toISODate(cutoff);

  var totals = {};
  var grandTotal = 0;

  transactions.forEach(function (t) {
    if (t.type !== "out" || t.status !== "Completed") { return; }
    if (t.date < cutoffISO) { return; }

    totals[t.category] = (totals[t.category] || 0) + t.amount;
    grandTotal += t.amount;
  });

  var rows = Object.keys(totals).map(function (name) {
    return {
      name: name,
      total: totals[name],
      share: grandTotal > 0 ? (totals[name] / grandTotal) * 100 : 0
    };
  });

  rows.sort(function (a, b) { return b.total - a.total; });

  return { rows: rows, total: grandTotal, days: windowDays };
}

/* ==========================================================================
   Automatic insights
   Plain-language observations generated from the data, so the user is told
   what changed instead of being left to read the numbers themselves.
   Each insight is { tone, title, text } where tone drives the colour.
   ========================================================================== */

/* Completed money out for a month offset back from the current one. */
function monthOutTotal(transactions, monthsBack) {
  var now = todayAtMidnight();
  var target = new Date(now.getFullYear(), now.getMonth() - monthsBack, 1);
  var key = target.getFullYear() + "-" +
            String(target.getMonth() + 1).padStart(2, "0");

  return transactions.reduce(function (sum, t) {
    if (t.type !== "out" || t.status !== "Completed") { return sum; }
    return t.date.slice(0, 7) === key ? sum + t.amount : sum;
  }, 0);
}

function buildInsights(transactions) {
  var insights = [];
  var summary = calculateSummary(transactions);

  /* 1. Where the money actually goes ------------------------------------- */
  var breakdown = spendingByCategory(transactions, 30);
  if (breakdown.rows.length > 0) {
    var top = breakdown.rows[0];
    insights.push({
      tone: "info",
      title: "Biggest spend: " + top.name,
      text: formatRWF(top.total) + " over the last 30 days - " +
            Math.round(top.share) + "% of everything you spent."
    });
  }

  /* 2. Is this month better or worse than last? -------------------------- */
  var thisMonth = monthOutTotal(transactions, 0);
  var lastMonth = monthOutTotal(transactions, 1);
  if (lastMonth > 0) {
    var change = ((thisMonth - lastMonth) / lastMonth) * 100;
    var spendingLess = change < 0;
    insights.push({
      tone: spendingLess ? "good" : "warn",
      title: spendingLess
        ? "Spending down " + Math.abs(Math.round(change)) + "%"
        : "Spending up " + Math.round(change) + "%",
      text: "You have spent " + formatRWF(thisMonth) + " this month against " +
            formatRWF(lastMonth) + " last month."
    });
  }

  /* 3. Money that has not landed yet ------------------------------------- */
  var pending = transactions.reduce(function (sum, t) {
    return t.status === "Pending" ? sum + t.amount : sum;
  }, 0);
  if (pending > 0) {
    insights.push({
      tone: "warn",
      title: "Pending: " + formatRWF(pending),
      text: "Payments still clearing. They are not counted in your balance yet."
    });
  }

  /* 4. Failed payments worth retrying ------------------------------------ */
  var failed = transactions.filter(function (t) { return t.status === "Failed"; });
  if (failed.length > 0) {
    insights.push({
      tone: "bad",
      title: failed.length + (failed.length === 1 ? " failed payment" : " failed payments"),
      text: "Worth retrying - the most recent was \"" + failed[0].description + "\"."
    });
  }

  /* 5. Savings rate for the month ---------------------------------------- */
  if (summary.moneyIn > 0) {
    var rate = ((summary.moneyIn - summary.moneyOut) / summary.moneyIn) * 100;
    insights.push({
      tone: rate >= 20 ? "good" : "warn",
      title: "Savings rate: " + Math.round(rate) + "%",
      text: rate >= 20
        ? "You are keeping a healthy share of what comes in this month."
        : "Under 20% of your income is staying put this month."
    });
  }

  return insights;
}

/* ==========================================================================
   Shared table rendering - used by the dashboard and the transactions page
   ========================================================================== */

/* Build one <tr> for a transaction. `options` picks which optional cells to
   render, so the dashboard (compact) and the transactions page (full) share it. */
function buildTransactionRow(t, options) {
  var showReference = options && options.reference;
  var showMethod = options && options.method;
  var showCategory = options && options.category;
  var row = document.createElement("tr");

  /* Rows are clickable: openTransactionModal() reads this id back. */
  row.className = "row-clickable";
  row.setAttribute("data-tx-id", t.id);
  row.setAttribute("tabindex", "0");
  row.setAttribute("role", "button");
  row.setAttribute("aria-label", "View details for " + t.description);

  function cell(text, className) {
    var td = document.createElement("td");
    td.textContent = text;
    if (className) { td.className = className; }
    row.appendChild(td);
    return td;
  }

  cell(formatDisplayDate(t.date));
  if (showReference) { cell(t.reference); }
  cell(t.description, "desc");

  // Type pill
  var typeCell = document.createElement("td");
  var pill = document.createElement("span");
  pill.className = "type-pill";
  pill.textContent = t.type === "in" ? "Money In" : "Money Out";
  typeCell.appendChild(pill);
  row.appendChild(typeCell);

  if (showCategory) {
    var categoryCell = document.createElement("td");
    var tag = document.createElement("span");
    tag.className = "cat-tag";
    tag.textContent = t.category;
    categoryCell.appendChild(tag);
    row.appendChild(categoryCell);
  }

  if (showMethod) { cell(t.method); }

  // Amount: green with "+" for money in, red with "-" for money out
  var amountCell = document.createElement("td");
  amountCell.className = "num " + (t.type === "in" ? "amount-in" : "amount-out");
  amountCell.textContent = (t.type === "in" ? "+" : "-") + formatRWF(t.amount);
  row.appendChild(amountCell);

  // Status badge
  var statusCell = document.createElement("td");
  var badge = document.createElement("span");
  badge.className = "badge badge--" + t.status.toLowerCase();
  badge.textContent = t.status;
  statusCell.appendChild(badge);
  row.appendChild(statusCell);

  return row;
}

