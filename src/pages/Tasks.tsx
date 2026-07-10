/*
 * ファイル名: Tasks.tsx
 * 作成者: やわらか背骨チャンネル
 * 初版作成日: 2026年6月15日
 * 最終更新日: 2026年7月8日
 *
 * 概要:
 * タスクの追加、編集、削除、完了状態の切り替えを行う画面。
 * 未完了・完了タブと、TsumiTsumi判定の優先度順表示を管理する。
 *
 * 変更履歴:
 * 2026年6月15日  タスク確認画面を作成
 * 2026年6月23日  タスク追加・編集・削除・完了切り替え機能を追加
 * 2026年6月23日  自動優先度表示を追加
 * 2026年6月23日  未完了・完了タブと優先度順表示を追加
 * 2026年6月26日  コード規約に沿ったコメントを追加
 * 2026年6月26日  ソースコードヘッダを追加
 * 2026年7月2日  Issue #27 タスク追加・編集時の入力チェックを追加
 * 2026年7月2日  Issue #42 自動優先度表示を改善
 * 2026年7月8日  Issue #28 タスク操作をid基準に変更
 * 2026年7月8日  Issue #43 入力エラーメッセージの文言を統一
 * 2026年7月8日  編集時にページ上部へスクロールする処理を追加
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { useAppData } from "../hooks/useAppData";
import type { Task } from "../types/task";
import {
  judgeAutoPriority,
  type AutoPriorityLevel,
} from "../utils/taskPriority";
import { createTaskId } from "../utils/taskId";

type TaskTab = "incomplete" | "completed";

interface DisplayTask {
  task: Task;
  autoPriority: ReturnType<typeof judgeAutoPriority>;
}

const priorityOrder: Record<AutoPriorityLevel, number> = {
  高: 0,
  中: 1,
  低: 2,
};

const taskErrorMessages = {
  nameRequired: "タスク名を入力してください",
  deadlineRequired: "締切日を入力してください",
  estimatedMinutesRequired: "見積時間を入力してください",
  estimatedMinutesMin: "見積時間は1分以上にしてください",
  importanceRequired: "重要度を選択してください",
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
  const [estimatedMinutes, setEstimatedMinutes] = useState("30");
  const [importance, setImportance] = useState("3");
  const [errorMessage, setErrorMessage] = useState("");
  // nullなら追加中、文字列ならそのidのタスクを編集中としてフォームの動きを切り替える。
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  // タブの選択状態も画面の状態なのでuseStateで持つ。初期表示は未完了タスクにする。
  const [activeTab, setActiveTab] = useState<TaskTab>("incomplete");
  const incompleteTaskCount = tasks.filter((task) => !task.completed).length;
  const completedTaskCount = tasks.length - incompleteTaskCount;
  // mapで自動優先度を足し、filterでタブに合うタスクだけに絞り、sortで表示順を整える。
  const displayTasks: DisplayTask[] = tasks
    .map((task) => ({
      task,
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
    setEstimatedMinutes("30");
    setImportance("3");
    setErrorMessage("");
    setEditingTaskId(null);
  };

  const saveTask = () => {
    const trimmedName = name.trim();
    const estimatedMinutesValue = Number(estimatedMinutes);
    const importanceValue = Number(importance);

    // 入力不足や不自然な値のまま保存すると一覧で意味が分からなくなるため、項目ごとに確認する。
    if (trimmedName === "") {
      setErrorMessage(taskErrorMessages.nameRequired);
      return;
    }

    if (deadline === "") {
      setErrorMessage(taskErrorMessages.deadlineRequired);
      return;
    }

    if (estimatedMinutes === "") {
      setErrorMessage(taskErrorMessages.estimatedMinutesRequired);
      return;
    }

    if (estimatedMinutesValue <= 0) {
      setErrorMessage(taskErrorMessages.estimatedMinutesMin);
      return;
    }

    if (importance === "") {
      setErrorMessage(taskErrorMessages.importanceRequired);
      return;
    }

    const editingTask =
      editingTaskId === null
        ? undefined
        : tasks.find((currentTask) => currentTask.id === editingTaskId);
    const task: Task = {
      id: editingTask?.id ?? createTaskId(),
      name: trimmedName,
      deadline,
      estimatedMinutes: estimatedMinutesValue,
      importance: importanceValue,
      // 編集時は完了状態を引き継ぎ、内容を直しただけで未完了に戻らないようにする。
      completed: editingTask?.completed ?? false,
    };

    // editingTaskIdがnullなら追加、文字列なら既存タスクの更新として扱う。
    if (editingTaskId === null) {
      addTask(task);
    } else {
      updateTask(editingTaskId, task);
    }

    resetForm();
  };

  const startEditTask = (task: Task) => {
    // 編集ボタンを押したタスクの値をフォームに戻し、同じ入力欄で修正できるようにする。
    setName(task.name);
    setDeadline(task.deadline);
    setEstimatedMinutes(String(task.estimatedMinutes));
    setImportance(String(task.importance));
    setEditingTaskId(task.id);
    setErrorMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteTask = (id: string) => {
    // 編集中のタスクを削除した場合でもフォームに古い値が残らないようリセットする。
    deleteTask(id);
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
            <h2>{editingTaskId === null ? "タスク追加" : "タスク編集"}</h2>
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
              onInput={(event) => setEstimatedMinutes(event.currentTarget.value)}
            />
          </label>

          <label>
            <span>重要度（1-5）</span>
            <input
              type="number"
              min="1"
              max="5"
              value={importance}
              onInput={(event) => setImportance(event.currentTarget.value)}
            />
          </label>
        </div>

        {errorMessage !== "" && <p className="error-text">{errorMessage}</p>}

        <div className="form-actions">
          <button className="primary-button" type="button" onClick={saveTask}>
            {editingTaskId === null ? "タスク追加" : "変更を保存"}
          </button>
          {editingTaskId !== null && (
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

        {activeTab === "incomplete" && (
          <p className="muted-text priority-help-text">
            自動優先度は、締切・入力した重要度・見積時間・診断結果をもとに判定しています。
          </p>
        )}

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
            {displayTasks.map(({ task, autoPriority }) => {
              return (
                <li
                  className={
                    task.completed ? "task-item is-completed" : "task-item"
                  }
                  key={task.id}
                >
                  <div className="task-main">
                    <button
                      className="check-button"
                      type="button"
                      onClick={() => toggleTaskCompleted(task.id)}
                      aria-label={`${task.name}の完了状態を切り替える`}
                    >
                      {task.completed ? "✓" : ""}
                    </button>
                    <div>
                      <strong>{task.name}</strong>
                      <p>
                        締切: {task.deadline} / 見積: {task.estimatedMinutes}分 /
                        入力した重要度: {task.importance}
                      </p>
                      <div
                        className={`auto-priority-box auto-priority-${autoPriority.level}`}
                      >
                        <div className="auto-priority-header">
                          <span>アプリ判定の自動優先度</span>
                          <span
                            className={`priority-badge priority-${autoPriority.level}`}
                          >
                            {autoPriority.level}
                          </span>
                        </div>
                        <p>理由: {autoPriority.reason}</p>
                      </div>
                    </div>
                  </div>
                  <div className="task-actions">
                    <button
                      type="button"
                      onClick={() => toggleTaskCompleted(task.id)}
                    >
                      {task.completed ? "未完了に戻す" : "完了にする"}
                    </button>
                    <button type="button" onClick={() => startEditTask(task)}>
                      編集
                    </button>
                    <button
                      className="danger-button"
                      type="button"
                      onClick={() => handleDeleteTask(task.id)}
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
