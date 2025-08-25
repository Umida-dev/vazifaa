const STORAGE_KEY = "todos.v1";
const form = document.getElementById("todo-form");
const input = document.getElementById("new-todo");
const list = document.getElementById("todo-list");
const itemsLeft = document.getElementById("items-left");
const clearCompletedBtn = document.getElementById("clear-completed");
const filtersContainer = document.querySelector(".filters");
let todos = [];
let currentFilter = "all";
function generateId() {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
function saveTodos() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}
function loadTodos() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            todos = parsed.map((t) => ({ ...t, title: t.title.trim() }));
        }
    }
    catch {
        todos = [];
    }
}
function applyFilter(items, filter) {
    if (filter === "active")
        return items.filter((t) => !t.completed);
    if (filter === "completed")
        return items.filter((t) => t.completed);
    return items;
}
function updateItemsLeft() {
    const remaining = todos.filter((t) => !t.completed).length;
    itemsLeft.textContent = `${remaining} ${remaining === 1 ? "item" : "items"} left`;
}
function setActiveFilterButton() {
    const buttons = Array.from(filtersContainer.querySelectorAll(".filter"));
    buttons.forEach((btn) => btn.classList.remove("active"));
    const active = filtersContainer.querySelector(`.filter[data-filter="${currentFilter}"]`);
    if (active)
        active.classList.add("active");
}
function render() {
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
function addTodo(title) {
    const trimmed = title.trim();
    if (!trimmed)
        return;
    todos.unshift({ id: generateId(), title: trimmed, completed: false, createdAt: Date.now() });
    saveTodos();
    render();
}
function toggleTodo(id) {
    todos = todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
    saveTodos();
    render();
}
function deleteTodo(id) {
    todos = todos.filter((t) => t.id !== id);
    saveTodos();
    render();
}
function editTodo(id, newTitle) {
    const trimmed = newTitle.trim();
    if (!trimmed) {
        deleteTodo(id);
        return;
    }
    todos = todos.map((t) => (t.id === id ? { ...t, title: trimmed } : t));
    saveTodos();
    render();
}
function clearCompleted() {
    todos = todos.filter((t) => !t.completed);
    saveTodos();
    render();
}
function startEditing(li, id, currentTitle) {
    if (li.classList.contains("editing"))
        return;
    li.classList.add("editing");
    const input = document.createElement("input");
    input.type = "text";
    input.className = "edit-input";
    input.value = currentTitle;
    input.setAttribute("aria-label", "Edit task");
    const titleSpan = li.querySelector(".title");
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
    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            commit();
        }
        else if (e.key === "Escape") {
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
    const target = e.target;
    const li = target.closest(".todo-item");
    if (!li)
        return;
    const id = li.dataset.id;
    if (target.classList.contains("toggle")) {
        toggleTodo(id);
    }
    else if (target.classList.contains("delete")) {
        deleteTodo(id);
    }
    else if (target.classList.contains("edit")) {
        const titleSpan = li.querySelector(".title");
        startEditing(li, id, titleSpan.textContent ?? "");
    }
});
list.addEventListener("dblclick", (e) => {
    const target = e.target;
    if (target.classList.contains("title")) {
        const li = target.closest(".todo-item");
        if (!li)
            return;
        const id = li.dataset.id;
        startEditing(li, id, target.textContent ?? "");
    }
});
filtersContainer.addEventListener("click", (e) => {
    const target = e.target;
    if (target.matches(".filter")) {
        const filter = (target.getAttribute("data-filter") || "all");
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
export {};
//# sourceMappingURL=app.js.map