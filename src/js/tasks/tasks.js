import "./tasks.css";

const SHOW_ERROR_CLASS = "tasks-form-error_visible";

export class Tasks {
    constructor(root) {
        this._root = root;
        if (typeof root === "string") {
            this._root = document.querySelector(root);
        }

        this._tasks = [new Task("Test task"), new Task("Test task2", true)];

        this.pinnedTasksContainer = null;
        this.allTasksContainer = null;
        this.errorElement = null;

        this.timeoutId = null;
        this.filterText = "";
    }

    init() {
        this._root.insertAdjacentHTML("beforeend", this.renderTasks());

        this.setElements();
        this.initEvents();
        this.updateTasks();
    }

    setElements() {
        this.pinnedTasksContainer =
            this._root.querySelector(".list-pinned-tasks");
        this.allTasksContainer = this._root.querySelector(".list-all-tasks");
        this.errorElement = this._root.querySelector(".tasks-form-error");
    }

    renderTasks() {
        return `
            <div class="tasks">
                <h1>TOP Tasks</h1>
                <form class="tasks-form">
                    <input class="tasks-form-input" name="task" placeholder="Введите название задачи"/>
                    <div class="tasks-form-error">Название задачи не должно быть пустым</div>
                </form>
                <div class="tasks-pinned">
                    <h2>Pinned:</h2>
                    <ul class="list list-pinned-tasks"></ul>
                </div>
                <div class="tasks-all">
                    <h2>All Tasks:</h2>
                    <ul class="list list-all-tasks"></ul>
                </div>
            </div>
        `;
    }

    renderTask(task) {
        return `
            <li class="list-item" id="${task.id}">
                <label class="list-item-label">
                    ${task.text}
                    <div class="checkbox">
                        <input class="checkbox-input" type="checkbox" ${
                            task.pinned ? "checked" : ""
                        } />
                        <div class="checkbox-figure">V</div>
                    </div>
                </label>
                <button class="btn-remove" type="button">X</button>
            </li>
        `;
    }

    initEvents() {
        this._root
            .querySelector(".tasks-form")
            .addEventListener("submit", this.onCreateTask.bind(this));
        this._root
            .querySelector(".tasks-form-input")
            .addEventListener("input", this.onFilterChange.bind(this));
        this._root
            .querySelector(".tasks")
            .addEventListener("click", this.onTaskActions.bind(this));
    }

    onFilterChange(e) {
        clearTimeout(this.timeoutId);
        this.filterText = e.target.value;

        this.setVisibleToErrorElement(false);

        setTimeout(() => this.updateTasks(), 100);
    }

    onCreateTask(e) {
        e.preventDefault();

        const form = e.target;
        const fd = new FormData(form);
        const taskText = fd.get("task");

        if (taskText.trim()) {
            this.addTask(taskText);

            form.reset();
            this.filterText = "";

            this.updateTasks();
            this.scrollToLastListItem();
        } else {
            this.setVisibleToErrorElement(true);
        }
    }

    onTaskActions(e) {
        const target = e.target;
        const isCheckbox = target.classList.contains("checkbox-input");
        const isBtnRemove = target.classList.contains("btn-remove");

        if (!isCheckbox && !isBtnRemove) {
            return;
        }

        const id = target.closest(".list-item").getAttribute("id");
        const task = this._tasks.find((t) => t.id === id);

        if (isCheckbox) {
            task.togglePinned();
        } else {
            task.remove();
            this._tasks = this._tasks.filter((t) => t.id !== id);
        }

        this.updateTasks();
    }

    onPinned(e) {
        const target = e.target;

        if (target.classList.contains("checkbox-input")) {
            const id = target.closest(".list-item").getAttribute("id");
            const task = this._tasks.find((t) => t.id === id);
            task.togglePinned();
            this.updateTasks();
        }
    }

    updateTasks() {
        const tasks = this._tasks;
        const allTasks = [];
        const pinnedTasks = [];

        for (const task of tasks) {
            if (task.pinned) {
                pinnedTasks.push(task);
            } else {
                if (
                    !this.filterText ||
                    (this.filterText &&
                        task.text
                            .toLowerCase()
                            .includes(this.filterText.toLowerCase()))
                ) {
                    allTasks.push(task);
                }
            }
        }

        tasks.forEach((task) => task.remove());
        this.allTasksContainer.querySelector(".plug")?.remove();
        this.pinnedTasksContainer.querySelector(".plug")?.remove();

        this.allTasksContainer.insertAdjacentHTML(
            "beforeend",
            allTasks.length > 0
                ? allTasks.map(this.renderTask).join("")
                : this.renderPlug("tasks")
        );
        this.pinnedTasksContainer.insertAdjacentHTML(
            "beforeend",
            pinnedTasks.length > 0
                ? pinnedTasks.map(this.renderTask).join("")
                : this.renderPlug()
        );
    }

    addTask(text) {
        this._tasks.push(new Task(text));
    }

    scrollToLastListItem() {
        const items = [...this._root.querySelectorAll(".list-item")];

        if (!items.length) {
            return;
        }

        const lastItem = items[items.length - 1];
        lastItem?.scrollIntoView();
    }

    renderPlug(type = "pinned") {
        const text = type === "pinned" ? "No pinned tasks" : "No tasks found";
        return `
            <li class="list-item list-item_border_no plug">
                <h3>${text}</h3>
            </li>
        `;
    }

    setVisibleToErrorElement(value) {
        if (value) {
            this.errorElement.classList.add(SHOW_ERROR_CLASS);
        } else {
            this.errorElement.classList.remove(SHOW_ERROR_CLASS);
        }
    }
}

class Task {
    constructor(text, pinned) {
        this.id = createId();
        this.text = text;
        this.pinned = pinned || false;
    }

    togglePinned() {
        this.pinned = !this.pinned;
    }

    remove() {
        document.querySelector(`#${this.id}`)?.remove();
    }
}

function createId() {
    return "id" + Math.random().toString(16).slice(2) + String(Date.now());
}
