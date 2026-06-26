import { useState } from "react";
import { Link } from "react-router-dom";
import { useAppData } from "../hooks/useAppData";
import type { Task } from "../types/task";
import {
  judgeAutoPriority,
  type AutoPriorityLevel,
} from "../utils/taskPriority";

type TaskTab = "incomplete" | "completed";

// 表示用のタスクには元の配列indexも持たせる。並び替え後でも正しいタスクを操作するため。
interface DisplayTask {
  task: Task;
  index: number;
  autoPriority: ReturnType<typeof judgeAutoPriority>;
}

const priorityOrder: Record<AutoPriorityLevel, number> = {
  高: 0,
  中: 1,
  低: 2,
};

function compareDeadline(firstDeadline: string, secondDeadline: string) {
  return (
    new Date(`${firstDeadline}T00:00:00`).getTime() -
    new Date(`${secondDeadline}T00:00:00`).getTime()
  );
}

function Tasks() {
  const {
    tasks,
    diagnosisResult,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskCompleted,
  } = useAppData();
  // 入力欄の値はuseStateで管理する。入力のたびに画面の値とStateを同じ状態にするため。
  const [name, setName] = useState("");
  const [deadline, setDeadline] = useState("");
  const [estimatedMinutes, setEstimatedMinutes] = useState(30);
  const [importance, setImportance] = useState(3);
  const [errorMessage, setErrorMessage] = useState("");
  // nullなら追加中、数値ならそのindexのタスクを編集中としてフォームの動きを切り替える。
  const [editingTaskIndex, setEditingTaskIndex] = useState<number | null>(null);
  // タブの選択状態も画面の状態なのでuseStateで持つ。初期表示は未完了タスクにする。
  const [activeTab, setActiveTab] = useState<TaskTab>("incomplete");
  const incompleteTaskCount = tasks.filter((task) => !task.completed).length;
  const completedTaskCount = tasks.length - incompleteTaskCount;
  // mapで自動優先度を足し、filterでタブに合うタスクだけに絞り、sortで表示順を整える。
  const displayTasks: DisplayTask[] = tasks
    .map((task, index) => ({
      task,
      index,
      autoPriority: judgeAutoPriority(task, diagnosisResult),
    }))
    .filter(({ task }) =>
      activeTab === "incomplete" ? !task.completed : task.completed,
    )
    .sort((firstTask, secondTask) => {
      if (activeTab === "completed") {
        // 完了タスクは振り返りやすさを優先し、締切が近い順に並べる。
        return compareDeadline(firstTask.task.deadline, secondTask.task.deadline);
      }

      // 未完了タスクは、今取りかかる順番が分かるよう自動優先度を優先して並べる。
      const priorityDiff =
        priorityOrder[firstTask.autoPriority.level] -
        priorityOrder[secondTask.autoPriority.level];

      if (priorityDiff !== 0) {
        return priorityDiff;
      }

      // 優先度が同じ場合は締切が近いものを上にして、見落としを防ぐ。
      return compareDeadline(firstTask.task.deadline, secondTask.task.deadline);
    });

  const resetForm = () => {
    setName("");
    setDeadline("");
    setEstimatedMinutes(30);
    setImportance(3);
    setErrorMessage("");
    setEditingTaskIndex(null);
  };

  const saveTask = () => {
    // 入力不足のまま保存すると一覧で意味が分からなくなるため、最低限の項目を確認する。
    if (name.trim() === "" || deadline === "") {
      setErrorMessage("タスク名と締切を入力してください。");
      return;
    }

    const task: Task = {
      name: name.trim(),
      deadline,
      estimatedMinutes,
      importance,
      // 編集時は完了状態を引き継ぎ、内容を直しただけで未完了に戻らないようにする。
      completed:
        editingTaskIndex === null ? false : tasks[editingTaskIndex].completed,
    };

    // editingTaskIndexがnullなら追加、数値なら既存タスクの更新として扱う。
    if (editingTaskIndex === null) {
      addTask(task);
    } else {
      updateTask(editingTaskIndex, task);
    }

    resetForm();
  };

  const startEditTask = (index: number) => {
    // 編集ボタンを押したタスクの値をフォームに戻し、同じ入力欄で修正できるようにする。
    const task = tasks[index];
    setName(task.name);
    setDeadline(task.deadline);
    setEstimatedMinutes(task.estimatedMinutes);
    setImportance(task.importance);
    setEditingTaskIndex(index);
    setErrorMessage("");
  };

  const handleDeleteTask = (index: number) => {
    // 編集中のタスクを削除した場合でもフォームに古い値が残らないようリセットする。
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
            重要度と診断結果をもとに、TsumiTsumiが優先度を自動判定します。
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
            <span>重要度（1-5）</span>
            <input
              type="number"
              min="1"
              max="5"
              value={importance}
              onInput={(event) =>
                setImportance(Number(event.currentTarget.value))
              }
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
          <span className="status-pill">
            {activeTab === "incomplete" ? incompleteTaskCount : completedTaskCount}
            件
          </span>
        </div>

        <div className="tab-list" role="tablist" aria-label="タスク表示切り替え">
          <button
            className={activeTab === "incomplete" ? "tab-button is-active" : "tab-button"}
            type="button"
            role="tab"
            aria-selected={activeTab === "incomplete"}
            onClick={() => setActiveTab("incomplete")}
          >
            未完了タスク
            <span>{incompleteTaskCount}</span>
          </button>
          <button
            className={activeTab === "completed" ? "tab-button is-active" : "tab-button"}
            type="button"
            role="tab"
            aria-selected={activeTab === "completed"}
            onClick={() => setActiveTab("completed")}
          >
            完了タスク
            <span>{completedTaskCount}</span>
          </button>
        </div>

        {displayTasks.length === 0 ? (
          <div className="empty-state">
            <strong>
              {activeTab === "incomplete"
                ? "未完了タスクはありません。"
                : "完了タスクはまだありません。"}
            </strong>
            <p>
              {activeTab === "incomplete"
                ? "新しいタスクを追加すると、TsumiTsumi判定の優先度順にここへ表示されます。"
                : "タスクを完了にすると、ここで振り返れるようになります。"}
            </p>
          </div>
        ) : (
          <ul className="task-list">
            {displayTasks.map(({ task, index, autoPriority }) => {
              return (
                <li
                  className={
                    task.completed ? "task-item is-completed" : "task-item"
                  }
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
                        重要度: {task.importance}
                      </p>
                      <div className="auto-priority-box">
                        <span>TsumiTsumi判定</span>
                        <strong>
                          優先度:
                          <span
                            className={`priority-badge priority-${autoPriority.level}`}
                          >
                            {autoPriority.level}
                          </span>
                        </strong>
                        <p>理由: {autoPriority.reason}</p>
                      </div>
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
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}

export default Tasks;
