import { useState } from "react";
import { Link } from "react-router-dom";
import { useAppData } from "../hooks/useAppData";
import type { Task } from "../types/task";

function Tasks() {
  const {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskCompleted,
  } = useAppData();
  const [name, setName] = useState("");
  const [deadline, setDeadline] = useState("");
  const [estimatedMinutes, setEstimatedMinutes] = useState(30);
  const [priority, setPriority] = useState(3);
  const [errorMessage, setErrorMessage] = useState("");
  const [editingTaskIndex, setEditingTaskIndex] = useState<number | null>(null);

  const resetForm = () => {
    setName("");
    setDeadline("");
    setEstimatedMinutes(30);
    setPriority(3);
    setErrorMessage("");
    setEditingTaskIndex(null);
  };

  const saveTask = () => {
    if (name.trim() === "" || deadline === "") {
      setErrorMessage("タスク名と締切を入力してください。");
      return;
    }

    const task: Task = {
      name: name.trim(),
      deadline,
      estimatedMinutes,
      priority,
      completed:
        editingTaskIndex === null ? false : tasks[editingTaskIndex].completed,
    };

    if (editingTaskIndex === null) {
      addTask(task);
    } else {
      updateTask(editingTaskIndex, task);
    }

    resetForm();
  };

  const startEditTask = (index: number) => {
    const task = tasks[index];
    setName(task.name);
    setDeadline(task.deadline);
    setEstimatedMinutes(task.estimatedMinutes);
    setPriority(task.priority);
    setEditingTaskIndex(index);
    setErrorMessage("");
  };

  const handleDeleteTask = (index: number) => {
    deleteTask(index);
    resetForm();
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
            <h2>{editingTaskIndex === null ? "タスク追加" : "タスク編集"}</h2>
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

        <div className="form-actions">
          <button className="primary-button" type="button" onClick={saveTask}>
            {editingTaskIndex === null ? "タスク追加" : "変更を保存"}
          </button>
          {editingTaskIndex !== null && (
            <button className="secondary-button" type="button" onClick={resetForm}>
              キャンセル
            </button>
          )}
        </div>
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
                    onClick={() => toggleTaskCompleted(index)}
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
                  <button
                    type="button"
                    onClick={() => toggleTaskCompleted(index)}
                  >
                    {task.completed ? "未完了に戻す" : "完了にする"}
                  </button>
                  <button type="button" onClick={() => startEditTask(index)}>
                    編集
                  </button>
                  <button
                    className="danger-button"
                    type="button"
                    onClick={() => handleDeleteTask(index)}
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
