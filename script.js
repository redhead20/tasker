// Storage keys
const TASKS_KEY = "tasker_tasks";
const THEME_KEY = "tasker_theme";
const DONE_TOTAL_KEY = "tasker_done_total";

// State
let tasks = [];
let theme = "purple";
let doneTotal = 0;

const themes = {
  purple: ["#667eea", "#764ba2"],
  ocean: ["#2E3192", "#1BFFFF"],
  forest: ["#134E5E", "#71B280"],
  rose: ["#F857A6", "#FF5858"],
  black: ["#000000", "#1a1a1a"],
  lavender: ["#A8EDEA", "#FED6E3"],
};

window.addEventListener("DOMContentLoaded", init);

function init() {
  loadTheme();
  loadTasks();
  loadDoneTotal();

  renderTasks();
  updateStats();
  markSelectedThemeCard(theme);
  applyTheme(theme);

  const input = document.getElementById("task-input");
  const addBtn = document.getElementById("add-button");

  input.addEventListener("input", () => {
    addBtn.disabled = input.value.trim() === "";
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") addTask();
  });

  addBtn.addEventListener("click", addTask);

  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => switchTab(tab.dataset.tab));
  });

  document.querySelectorAll(".theme-card").forEach((card) => {
    card.addEventListener("click", () => changeTheme(card.dataset.theme));
  });

  // Start on Tasks view
  switchTab("tasks");
}

function addTask() {
  const input = document.getElementById("task-input");
  const text = input.value.trim();
  if (!text) return;

  const task = {
    id: Date.now().toString(),
    text,
    createdAt: Date.now(),
  };

  tasks.unshift(task);
  saveTasks();

  renderTasks();
  updateStats();

  input.value = "";
  document.getElementById("add-button").disabled = true;
  input.focus();
}

function completeTask(id) {
  // Animate out, then remove from tasks
  const el = document.querySelector(`[data-task-id="${id}"]`);
  if (el) el.classList.add("complete-out");

  // After animation, remove + increment doneTotal
  setTimeout(() => {
    tasks = tasks.filter((t) => t.id !== id);
    doneTotal += 1;

    saveTasks();
    saveDoneTotal();

    renderTasks();
    updateStats();
  }, 560);
}

function deleteTask(id) {
  tasks = tasks.filter((t) => t.id !== id);
  saveTasks();

  renderTasks();
  updateStats();
}

function renderTasks() {
  const list = document.getElementById("task-list");

  if (tasks.length === 0) {
    list.innerHTML = `<div class="empty">No tasks yet. Add one above 👆</div>`;
    return;
  }

  list.innerHTML = tasks
    .map(
      (task) => `
      <div class="task-item" data-task-id="${task.id}">
        <div class="task-checkbox" onclick="completeTask('${task.id}')" title="Complete"></div>
        <div class="task-text">${escapeHtml(task.text)}</div>
        <button class="delete-button" onclick="deleteTask('${task.id}')">Delete</button>
      </div>
    `
    )
    .join("");
}

function updateStats() {
  const active = tasks.length;
  document.getElementById("active-count").textContent = `${active} active`;
  document.getElementById("completed-count").textContent = `${doneTotal} done`;
}

/* Theme */
function changeTheme(name) {
  if (!themes[name]) return;
  theme = name;
  applyTheme(name);
  saveTheme();
  markSelectedThemeCard(name);
}

function applyTheme(name) {
  const colors = themes[name] || themes.purple;
  document.documentElement.style.setProperty("--color1", colors[0]);
  document.documentElement.style.setProperty("--color2", colors[1]);
}

function markSelectedThemeCard(name) {
  document.querySelectorAll(".theme-card").forEach((c) => c.classList.remove("selected"));
  const card = document.querySelector(`.theme-card[data-theme="${name}"]`);
  if (card) card.classList.add("selected");
}

/* Tabs */
function switchTab(tab) {
  document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
  document.querySelector(`.tab[data-tab="${tab}"]`)?.classList.add("active");

  const settings = document.getElementById("settings");
  const taskList = document.getElementById("task-list");

  if (tab === "settings") {
    settings.classList.add("active");
    taskList.style.display = "none";
  } else {
    settings.classList.remove("active");
    taskList.style.display = "flex";
  }
}

/* Storage */
function saveTasks() {
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

function loadTasks() {
  const raw = localStorage.getItem(TASKS_KEY);
  tasks = raw ? JSON.parse(raw) : [];
}

function saveTheme() {
  localStorage.setItem(THEME_KEY, theme);
}

function loadTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved && themes[saved]) theme = saved;
}

function saveDoneTotal() {
  localStorage.setItem(DONE_TOTAL_KEY, String(doneTotal));
}

function loadDoneTotal() {
  const raw = localStorage.getItem(DONE_TOTAL_KEY);
  doneTotal = raw ? Number(raw) : 0;
}

/* Utility */
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}