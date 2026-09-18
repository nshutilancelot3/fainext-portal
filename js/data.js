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

