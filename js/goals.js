/* ==========================================================================
   goals.js - savings goals: create, contribute, delete
   Goals are stored per account in localStorage, so two people registering on
   the same browser do not see each other's targets.
   Depends on auth.js (getSession) and data.js (formatRWF, date helpers).
   ========================================================================== */

var GOALS_KEY_PREFIX = "fainext_goals_";

/* Each account gets its own bucket, keyed off the email in the session. */
function goalsStorageKey(session) {
  return GOALS_KEY_PREFIX + String(session.email || "guest").toLowerCase();
}

/* --- Storage ------------------------------------------------------------- */
function loadGoals(session) {
  try {
    var raw = localStorage.getItem(goalsStorageKey(session));
    if (raw === null) { return seedGoals(session); }
    var parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

function saveGoals(session, goals) {
  try {
    localStorage.setItem(goalsStorageKey(session), JSON.stringify(goals));
    return true;
  } catch (e) {
    return false;
  }
}

/* First visit gets two realistic goals so the panel is never empty.
   Deleting them sticks, because an empty array is still a stored value. */
function seedGoals(session) {
  var today = todayAtMidnight();

  function monthsAhead(count) {
    var d = new Date(today.getFullYear(), today.getMonth() + count, today.getDate());
    return toISODate(d);
  }

  var seeded = [
    { id: 1, name: "Emergency fund", target: 1000000, saved: 350000, deadline: monthsAhead(8) },
    { id: 2, name: "Laptop upgrade", target: 850000, saved: 640000, deadline: monthsAhead(3) }
  ];

  saveGoals(session, seeded);
  return seeded;
}

/* Ids only need to be unique inside one account's list. */
function nextGoalId(goals) {
  return goals.reduce(function (highest, g) {
    return Math.max(highest, Number(g.id) || 0);
  }, 0) + 1;
}

/* ==========================================================================
   Rendering
   ========================================================================== */

/* How many days until the deadline - negative once it has passed. */
function daysUntil(isoDate) {
  var parts = String(isoDate).split("-");
  var target = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  var diff = target.getTime() - todayAtMidnight().getTime();
  return Math.round(diff / 86400000);
}

/* Short human description of the deadline. */
function deadlineLabel(isoDate) {
  if (!isoDate) { return "No deadline"; }

  var days = daysUntil(isoDate);
  if (days < 0) { return "Deadline passed"; }
  if (days === 0) { return "Due today"; }
  if (days === 1) { return "1 day left"; }
  if (days < 60) { return days + " days left"; }
  return Math.round(days / 30) + " months left";
}

function buildGoalCard(goal) {
  var percent = goal.target > 0
    ? Math.min(100, (goal.saved / goal.target) * 100)
    : 0;
  var complete = goal.saved >= goal.target;
  var remaining = Math.max(0, goal.target - goal.saved);

  var item = document.createElement("li");
  item.className = "goal" + (complete ? " goal--done" : "");

  /* Title row: name on the left, delete on the right */
  var head = document.createElement("div");
  head.className = "goal-head";

  var name = document.createElement("span");
  name.className = "goal-name";
  name.textContent = goal.name;

  var remove = document.createElement("button");
  remove.type = "button";
  remove.className = "goal-remove";
  remove.innerHTML = "&times;";
  remove.setAttribute("data-goal-delete", goal.id);
  remove.setAttribute("aria-label", "Delete goal " + goal.name);

  head.appendChild(name);
  head.appendChild(remove);

  /* Progress bar */
  var track = document.createElement("div");
  track.className = "goal-track";
  track.setAttribute("role", "progressbar");
  track.setAttribute("aria-valuenow", String(Math.round(percent)));
  track.setAttribute("aria-valuemin", "0");
  track.setAttribute("aria-valuemax", "100");
  track.setAttribute("aria-label", goal.name + " progress");

  var fill = document.createElement("div");
  fill.className = "goal-fill";
  fill.style.width = percent + "%";
  track.appendChild(fill);

  /* Figures under the bar */
  var figures = document.createElement("div");
  figures.className = "goal-figures";

  var saved = document.createElement("span");
  saved.innerHTML = "<strong>" + formatRWF(goal.saved) + "</strong> of " +
                    formatRWF(goal.target);

  var status = document.createElement("span");
  status.className = "goal-status";
  status.textContent = complete
    ? "Goal reached"
    : Math.round(percent) + "% - " + formatRWF(remaining) + " to go";

  figures.appendChild(saved);
  figures.appendChild(status);

  /* Deadline + contribute control */
  var foot = document.createElement("div");
  foot.className = "goal-foot";

  var deadline = document.createElement("span");
  deadline.className = "goal-deadline";
  deadline.textContent = deadlineLabel(goal.deadline);

  var contributeWrap = document.createElement("span");
  contributeWrap.className = "goal-contribute";

  var amountInput = document.createElement("input");
  amountInput.type = "number";
  amountInput.min = "0";
  amountInput.step = "1000";
  amountInput.placeholder = "Amount";
  amountInput.className = "goal-amount";
  amountInput.setAttribute("aria-label", "Amount to add to " + goal.name);

  var addButton = document.createElement("button");
  addButton.type = "button";
  addButton.className = "btn btn--sm";
  addButton.textContent = "Add";
  addButton.setAttribute("data-goal-add", goal.id);

  contributeWrap.appendChild(amountInput);
  contributeWrap.appendChild(addButton);

  foot.appendChild(deadline);
  foot.appendChild(contributeWrap);

  item.appendChild(head);
  item.appendChild(track);
  item.appendChild(figures);
  item.appendChild(foot);

  return item;
}

function renderGoals(session) {
  var list = document.getElementById("goal-list");
  var empty = document.getElementById("goal-empty");
  var totals = document.getElementById("goal-totals");
  if (!list) { return; }

  var goals = loadGoals(session);

  list.innerHTML = "";
  goals.forEach(function (goal) { list.appendChild(buildGoalCard(goal)); });

  if (empty) { empty.hidden = goals.length > 0; }

  /* Headline figure: how much is put aside across every goal. */
  if (totals) {
    if (goals.length === 0) {
      totals.textContent = "";
    } else {
      var savedTotal = goals.reduce(function (s, g) { return s + g.saved; }, 0);
      var targetTotal = goals.reduce(function (s, g) { return s + g.target; }, 0);
      var overall = targetTotal > 0 ? Math.round((savedTotal / targetTotal) * 100) : 0;
      totals.textContent = formatRWF(savedTotal) + " saved of " +
                           formatRWF(targetTotal) + " (" + overall + "%)";
    }
  }
}

/* ==========================================================================
   Actions
   ========================================================================== */
function addGoal(session, name, target, deadline) {
  var goals = loadGoals(session);
  goals.push({
    id: nextGoalId(goals),
    name: name,
    target: target,
    saved: 0,
    deadline: deadline || ""
  });
  saveGoals(session, goals);
  renderGoals(session);
}

function contributeToGoal(session, goalId, amount) {
  var goals = loadGoals(session);
  goals.forEach(function (goal) {
    if (Number(goal.id) === Number(goalId)) { goal.saved += amount; }
  });
  saveGoals(session, goals);
  renderGoals(session);
}

function deleteGoal(session, goalId) {
  var goals = loadGoals(session).filter(function (goal) {
    return Number(goal.id) !== Number(goalId);
  });
  saveGoals(session, goals);
  renderGoals(session);
}

/* ==========================================================================
   Wiring - called once from dashboard.js
   ========================================================================== */
function initGoals(session) {
  var list = document.getElementById("goal-list");
  var form = document.getElementById("goal-form");
  if (!list) { return; }

  renderGoals(session);

  /* Delegated, because every goal card is rebuilt on each render. */
  list.addEventListener("click", function (event) {
    var button = event.target;
    if (!button || button.tagName !== "BUTTON") { return; }

    var deleteId = button.getAttribute("data-goal-delete");
    if (deleteId) {
      deleteGoal(session, deleteId);
      return;
    }

    var addId = button.getAttribute("data-goal-add");
    if (!addId) { return; }

    /* The matching number input sits in the same wrapper as the button. */
    var input = button.parentNode.querySelector(".goal-amount");
    var amount = Math.round(Number(input.value));

    if (!amount || amount <= 0) {
      input.classList.add("invalid");
      input.focus();
      return;
    }

    input.classList.remove("invalid");
    contributeToGoal(session, addId, amount);
  });

  if (!form) { return; }

  /* New goal form */
  form.addEventListener("submit", function (event) {
    event.preventDefault();

    var nameInput = document.getElementById("goal-name");
    var targetInput = document.getElementById("goal-target");
    var deadlineInput = document.getElementById("goal-deadline");

    var name = nameInput.value.trim();
    var target = Math.round(Number(targetInput.value));
    var valid = true;

    if (!name) {
      setFieldError("goal-name", "Give the goal a name");
      valid = false;
    } else {
      setFieldError("goal-name", "");
    }

    if (!target || target <= 0) {
      setFieldError("goal-target", "Enter a target above zero");
      valid = false;
    } else {
      setFieldError("goal-target", "");
    }

    if (!valid) { return; }

    addGoal(session, name, target, deadlineInput.value);
    form.reset();

    /* Collapse the form again now the goal is in the list. */
    var panel = document.getElementById("goal-form-panel");
    var toggle = document.getElementById("goal-toggle");
    if (panel && toggle) {
      panel.hidden = true;
      toggle.textContent = "New goal";
      toggle.setAttribute("aria-expanded", "false");
    }
  });

  /* Show/hide the new-goal form */
  var toggleButton = document.getElementById("goal-toggle");
  var formPanel = document.getElementById("goal-form-panel");
  if (toggleButton && formPanel) {
    toggleButton.addEventListener("click", function () {
      var opening = formPanel.hidden;
      formPanel.hidden = !opening;
      toggleButton.textContent = opening ? "Cancel" : "New goal";
      toggleButton.setAttribute("aria-expanded", opening ? "true" : "false");
      if (opening) { document.getElementById("goal-name").focus(); }
    });
  }
}
