'use strict';

const STORAGE_KEY = 'todo-list.tasks';

const form = document.getElementById('todo-form');
const input = document.getElementById('todo-input');
const list = document.getElementById('todo-list');
const emptyState = document.getElementById('empty-state');

let tasks = load();

function createId() {
  if (window.crypto && typeof window.crypto.randomUUID === 'function') {
    return window.crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function load() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (t) => t && typeof t.id === 'string' && typeof t.text === 'string'
    );
  } catch {
    return [];
  }
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    // Storage unavailable (e.g. private mode or quota); keep working in memory.
  }
}

function addTask(rawText) {
  const text = rawText.trim();
  if (!text) return false;
  tasks = [...tasks, { id: createId(), text }];
  save();
  render();
  return true;
}

function deleteTask(id) {
  tasks = tasks.filter((t) => t.id !== id);
  save();
  render();
}

function render() {
  list.replaceChildren(
    ...tasks.map((task) => {
      const li = document.createElement('li');
      li.className = 'todo-item';

      const span = document.createElement('span');
      span.className = 'todo-text';
      span.textContent = task.text;

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'delete-btn';
      btn.dataset.id = task.id;
      btn.textContent = 'Delete';
      btn.setAttribute('aria-label', `Delete task: ${task.text}`);

      li.append(span, btn);
      return li;
    })
  );
  emptyState.hidden = tasks.length > 0;
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  addTask(input.value);
  input.value = '';
  input.focus();
});

list.addEventListener('click', (event) => {
  const btn = event.target.closest('.delete-btn');
  if (btn) deleteTask(btn.dataset.id);
});

render();
