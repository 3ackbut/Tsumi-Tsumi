import { useState } from "react";
import { Link } from "react-router-dom";
import { sampleTasks } from "../data/sampleData";
import type { Task } from "../types/task";

function Tasks() {
  const [tasks, setTasks] = useState<Task[]>(sampleTasks);
  const [name, setName] = useState("");
  const [deadline, setDeadline] = useState("");
  const [estimatedMinutes, setEstimatedMinutes] = useState(30);
  const [priority, setPriority] = useState(3);
  const [errorMessage, setErrorMessage] = useState("");

  const addTask = () => {
    if (name.trim() === "" || deadline === "") {
      setErrorMessage("タスク名と締切を入力してください。");
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
    setErrorMessage("");
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
    <main className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Tasks</p>
          <h1>タスク確認</h1>
          <p className="lead">
            タスクの追加、削除、完了状態の切り替えを行えます。
          </p>
        </div>
        <Link className="text-link" to="/">
          ホームへ
        </Link>
      </div>

      <section className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Add</p>
            <h2>タスク追加</h2>
          </div>
        </div>

        <div className="form-grid">
          <label>
            <span>タスク名</span>
            <input
              type="text"
              value={name}
              onInput={(event) => setName(event.currentTarget.value)}
              placeholder="例: レポート提出"
            />
          </label>

          <label>
            <span>締切</span>
            <input
              type="date"
              value={deadline}
              onInput={(event) => setDeadline(event.currentTarget.value)}
            />
          </label>

          <label>
            <span>見積時間（分）</span>
            <input
              type="number"
              min="1"
              value={estimatedMinutes}
              onInput={(event) =>
                setEstimatedMinutes(Number(event.currentTarget.value))
              }
            />
          </label>

          <label>
            <span>優先度（1-5）</span>
            <input
              type="number"
              min="1"
              max="5"
              value={priority}
              onInput={(event) => setPriority(Number(event.currentTarget.value))}
            />
          </label>
        </div>

        {errorMessage !== "" && <p className="error-text">{errorMessage}</p>}

        <button className="primary-button" type="button" onClick={addTask}>
          タスク追加
        </button>
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">List</p>
            <h2>タスク一覧</h2>
          </div>
          <span className="status-pill">{tasks.length}件</span>
        </div>

        {tasks.length === 0 ? (
          <p>タスクはありません。</p>
        ) : (
          <ul className="task-list">
            {tasks.map((task, index) => (
              <li
                className={task.completed ? "task-item is-completed" : "task-item"}
                key={`${task.name}-${task.deadline}-${index}`}
              >
                <div className="task-main">
                  <button
                    className="check-button"
                    type="button"
                    onClick={() => toggleCompleted(index)}
                    aria-label={`${task.name}の完了状態を切り替える`}
                  >
                    {task.completed ? "✓" : ""}
                  </button>
                  <div>
                    <strong>{task.name}</strong>
                    <p>
                      締切: {task.deadline} / 見積: {task.estimatedMinutes}分 /
                      優先度: {task.priority}
                    </p>
                  </div>
                </div>
                <div className="task-actions">
                  <button type="button" onClick={() => toggleCompleted(index)}>
                    {task.completed ? "未完了に戻す" : "完了にする"}
                  </button>
                  <button
                    className="danger-button"
                    type="button"
                    onClick={() => deleteTask(index)}
                  >
                    削除
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

export default Tasks;
