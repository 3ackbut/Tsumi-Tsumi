import { useState } from "react";
import type { Task } from "../types/task";

const initialTasks: Task[] = [
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

function Tasks() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [name, setName] = useState("");
  const [deadline, setDeadline] = useState("");
  const [estimatedMinutes, setEstimatedMinutes] = useState(30);
  const [priority, setPriority] = useState(3);

  const addTask = () => {
    if (name.trim() === "" || deadline === "") {
      return;
    }

    const newTask: Task = {
      name: name.trim(),
      deadline,
      estimatedMinutes,
      priority,
      completed: false,
    };

    setTasks((currentTasks) => [...currentTasks, newTask]);
    setName("");
    setDeadline("");
    setEstimatedMinutes(30);
    setPriority(3);
  };

  const deleteTask = (targetIndex: number) => {
    setTasks((currentTasks) =>
      currentTasks.filter((_, index) => index !== targetIndex),
    );
  };

  const toggleCompleted = (targetIndex: number) => {
    setTasks((currentTasks) =>
      currentTasks.map((task, index) =>
        index === targetIndex
          ? { ...task, completed: !task.completed }
          : task,
      ),
    );
  };

  return (
    <main>
      <h1>タスク確認</h1>

      <section>
        <h2>タスク追加</h2>

        <div>
          <label>
            タスク名
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </label>
        </div>

        <div>
          <label>
            締切
            <input
              type="date"
              value={deadline}
              onChange={(event) => setDeadline(event.target.value)}
            />
          </label>
        </div>

        <div>
          <label>
            見積時間（分）
            <input
              type="number"
              min="1"
              value={estimatedMinutes}
              onChange={(event) =>
                setEstimatedMinutes(Number(event.target.value))
              }
            />
          </label>
        </div>

        <div>
          <label>
            優先度
            <input
              type="number"
              min="1"
              max="5"
              value={priority}
              onChange={(event) => setPriority(Number(event.target.value))}
            />
          </label>
        </div>

        <button type="button" onClick={addTask}>
          タスク追加
        </button>
      </section>

      <section>
        <h2>タスク一覧</h2>

        {tasks.length === 0 ? (
          <p>タスクはありません。</p>
        ) : (
          <ul>
            {tasks.map((task, index) => (
              <li key={`${task.name}-${task.deadline}-${index}`}>
                <p>
                  {task.completed ? "☑" : "□"} {task.name}
                </p>
                <p>
                  締切: {task.deadline} / 見積: {task.estimatedMinutes}分 /
                  優先度: {task.priority}
                </p>
                <button type="button" onClick={() => toggleCompleted(index)}>
                  {task.completed ? "未完了に戻す" : "完了にする"}
                </button>
                <button type="button" onClick={() => deleteTask(index)}>
                  削除
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

export default Tasks;
