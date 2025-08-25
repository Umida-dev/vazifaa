type Todo = {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
};

type Filter = "all" | "active" | "completed";

const STORAGE_KEY = "todos.v1";

const form = document.getElementById("todo-form") as HTMLFormElement;
const input = document.getElementById("new-todo") as HTMLInputElement;
const list = document.getElementById("todo-list") as HTMLUListElement;
const itemsLeft = document.getElementById("items-left") as HTMLSpanElement;
const clearCompletedBtn = document.getElementById("clear-completed") as HTMLButtonElement;
const filtersContainer = document.querySelector(".filters") as HTMLElement;

let todos: Todo[] = [];
let currentFilter: Filter = "all";

function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function saveTodos(): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function loadTodos(): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Todo[];
      todos = parsed.map((t) => ({ ...t, title: t.title.trim() }));
    }
  } catch {
    todos = [];
  }
}

function applyFilter(items: Todo[], filter: Filter): Todo[] {
  if (filter === "active") return items.filter((t) => !t.completed);
  if (filter === "completed") return items.filter((t) => t.completed);
  return items;
}

function updateItemsLeft(): void {
  const remaining = todos.filter((t) => !t.completed).length;
  itemsLeft.textContent = `${remaining} ${remaining === 1 ? "item" : "items"} left`;
}

function setActiveFilterButton(): void {
  const buttons = Array.from(filtersContainer.querySelectorAll(".filter"));
  buttons.forEach((btn) => btn.classList.remove("active"));
  const active = filtersContainer.querySelector(`.filter[data-filter="${currentFilter}"]`);
  if (active) active.classList.add("active");
}

function render(): void {
  list.innerHTML = "";
  const visible = applyFilter(todos, currentFilter);

  for (const todo of visible) {
    const li = document.createElement("li");
    li.className = "todo-item" + (todo.completed ? " completed" : "");
    li.dataset.id = todo.id;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "toggle";
    checkbox.checked = todo.completed;
    checkbox.setAttribute("aria-label", "Toggle completed");

    const label = document.createElement("span");
    label.className = "title";
    label.textContent = todo.title;
    label.title = todo.title;

    const actions = document.createElement("div");
    actions.className = "actions";

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "icon-btn edit";
    editBtn.setAttribute("aria-label", "Edit todo");
    editBtn.textContent = "Edit";

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "icon-btn delete";
    deleteBtn.setAttribute("aria-label", "Delete todo");
    deleteBtn.textContent = "Delete";

    actions.append(editBtn, deleteBtn);
    li.append(checkbox, label, actions);
    list.appendChild(li);
  }

  updateItemsLeft();
  setActiveFilterButton();
}

function addTodo(title: string): void {
  const trimmed = title.trim();
  if (!trimmed) return;
  todos.unshift({ id: generateId(), title: trimmed, completed: false, createdAt: Date.now() });
  saveTodos();
  render();
}

function toggleTodo(id: string): void {
  todos = todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
  saveTodos();
  render();
}

function deleteTodo(id: string): void {
  todos = todos.filter((t) => t.id !== id);
  saveTodos();
  render();
}

function editTodo(id: string, newTitle: string): void {
  const trimmed = newTitle.trim();
  if (!trimmed) {
    deleteTodo(id);
    return;
  }
  todos = todos.map((t) => (t.id === id ? { ...t, title: trimmed } : t));
  saveTodos();
  render();
}

function clearCompleted(): void {
  todos = todos.filter((t) => !t.completed);
  saveTodos();
  render();
}

function startEditing(li: HTMLLIElement, id: string, currentTitle: string): void {
  if (li.classList.contains("editing")) return;
  li.classList.add("editing");

  const input = document.createElement("input");
  input.type = "text";
  input.className = "edit-input";
  input.value = currentTitle;
  input.setAttribute("aria-label", "Edit task");

  const titleSpan = li.querySelector(".title") as HTMLSpanElement;
  titleSpan.replaceWith(input);
  input.focus();
  input.setSelectionRange(currentTitle.length, currentTitle.length);

  const commit = () => {
    li.classList.remove("editing");
    editTodo(id, input.value);
  };

  const cancel = () => {
    li.classList.remove("editing");
    render();
  };

  input.addEventListener("keydown", (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      cancel();
    }
  });

  input.addEventListener("blur", commit);
}

// Event wiring
form.addEventListener("submit", (e) => {
  e.preventDefault();
  addTodo(input.value);
  input.value = "";
});

list.addEventListener("click", (e) => {
  const target = e.target as HTMLElement;
  const li = target.closest(".todo-item") as HTMLLIElement | null;
  if (!li) return;
  const id = li.dataset.id as string;

  if (target.classList.contains("toggle")) {
    toggleTodo(id);
  } else if (target.classList.contains("delete")) {
    deleteTodo(id);
  } else if (target.classList.contains("edit")) {
    const titleSpan = li.querySelector(".title") as HTMLSpanElement;
    startEditing(li, id, titleSpan.textContent ?? "");
  }
});

list.addEventListener("dblclick", (e) => {
  const target = e.target as HTMLElement;
  if (target.classList.contains("title")) {
    const li = target.closest(".todo-item") as HTMLLIElement | null;
    if (!li) return;
    const id = li.dataset.id as string;
    startEditing(li, id, target.textContent ?? "");
  }
});

filtersContainer.addEventListener("click", (e) => {
  const target = e.target as HTMLElement;
  if (target.matches(".filter")) {
    const filter = (target.getAttribute("data-filter") || "all") as Filter;
    currentFilter = filter;
    render();
  }
});

clearCompletedBtn.addEventListener("click", () => {
  clearCompleted();
});

// Init
loadTodos();
render();
