import "./app.css";

import { Tasks } from "./tasks/tasks";

document.addEventListener("DOMContentLoaded", () => {
    const tasks = new Tasks("#root");
    tasks.init();
});
