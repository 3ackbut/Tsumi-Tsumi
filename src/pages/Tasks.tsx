import type { Task } from "../types/task";

function Tasks() {
  const tasks: Task[] = [
    {
      name: "英語課題",
      deadline: "2026-06-20",
      estimatedMinutes: 60,
      priority: 3,
      completed: false,
    },
    {
      name: "発表準備",
      deadline: "2026-06-25",
      estimatedMinutes: 90,
      priority: 4,
      completed: true,
    },
  ];

  return (
    <main>
      <h1>タスク確認</h1>

      <ul>
        {tasks.map((task) => (
          <li key={task.name}>
            {task.completed ? "☑" : "□"} {task.name}
          </li>
        ))}
      </ul>

      <button>タスク追加</button>
    </main>
  );
}

export default Tasks;