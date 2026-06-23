import { useState } from "react";
import { Link } from "react-router-dom";
import { useAppData } from "../hooks/useAppData";
import type { Schedule } from "../types/schedule";

function Calendar() {
  const {
    tasks,
    schedules,
    addSchedule,
    updateSchedule,
    deleteSchedule,
  } = useAppData();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [editingScheduleIndex, setEditingScheduleIndex] = useState<
    number | null
  >(null);
  const dates = Array.from(
    new Set([
      ...schedules.map((schedule) => schedule.date),
      ...tasks.map((task) => task.deadline),
    ]),
  ).sort();

  const resetForm = () => {
    setTitle("");
    setDate("");
    setStartTime("");
    setEndTime("");
    setErrorMessage("");
    setEditingScheduleIndex(null);
  };

  const saveSchedule = () => {
    if (
      title.trim() === "" ||
      date === "" ||
      startTime === "" ||
      endTime === ""
    ) {
      setErrorMessage("予定名、日付、開始時刻、終了時刻を入力してください。");
      return;
    }

    if (startTime >= endTime) {
      setErrorMessage("終了時刻は開始時刻より後にしてください。");
      return;
    }

    const schedule: Schedule = {
      title: title.trim(),
      date,
      startTime,
      endTime,
    };

    if (editingScheduleIndex === null) {
      addSchedule(schedule);
    } else {
      updateSchedule(editingScheduleIndex, schedule);
    }

    resetForm();
  };

  const startEditSchedule = (index: number) => {
    const schedule = schedules[index];
    setTitle(schedule.title);
    setDate(schedule.date);
    setStartTime(schedule.startTime);
    setEndTime(schedule.endTime);
    setEditingScheduleIndex(index);
    setErrorMessage("");
  };

  const handleDeleteSchedule = (index: number) => {
    deleteSchedule(index);
    resetForm();
  };

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Calendar</p>
          <h1>カレンダー</h1>
          <p className="lead">
            日付ごとに予定と締切タスクを並べた、提出向けの簡易カレンダーです。
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
            <h2>{editingScheduleIndex === null ? "予定追加" : "予定編集"}</h2>
          </div>
        </div>

        <div className="form-grid">
          <label>
            <span>予定名</span>
            <input
              type="text"
              value={title}
              onInput={(event) => setTitle(event.currentTarget.value)}
              placeholder="例: グループ作業"
            />
          </label>

          <label>
            <span>日付</span>
            <input
              type="date"
              value={date}
              onInput={(event) => setDate(event.currentTarget.value)}
            />
          </label>

          <label>
            <span>開始時刻</span>
            <input
              type="time"
              value={startTime}
              onInput={(event) => setStartTime(event.currentTarget.value)}
            />
          </label>

          <label>
            <span>終了時刻</span>
            <input
              type="time"
              value={endTime}
              onInput={(event) => setEndTime(event.currentTarget.value)}
            />
          </label>
        </div>

        {errorMessage !== "" && <p className="error-text">{errorMessage}</p>}

        <div className="form-actions">
          <button className="primary-button" type="button" onClick={saveSchedule}>
            {editingScheduleIndex === null ? "予定追加" : "変更を保存"}
          </button>
          {editingScheduleIndex !== null && (
            <button className="secondary-button" type="button" onClick={resetForm}>
              キャンセル
            </button>
          )}
        </div>
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Schedule</p>
            <h2>日付別の予定とタスク</h2>
          </div>
        </div>

        <div className="day-list">
          {dates.length === 0 ? (
            <p className="muted-text">表示する予定やタスクはありません。</p>
          ) : (
            dates.map((dateItem) => {
              const daySchedules = schedules
                .map((schedule, index) => ({ schedule, index }))
                .filter(({ schedule }) => schedule.date === dateItem);
              const dayTasks = tasks.filter((task) => task.deadline === dateItem);

              return (
                <article className="day-card" key={dateItem}>
                  <div className="day-date">{dateItem}</div>

                  <div className="day-content">
                    <div>
                      <h3>予定</h3>
                      {daySchedules.length === 0 ? (
                        <p className="muted-text">予定はありません。</p>
                      ) : (
                        <ul className="compact-list schedule-list">
                          {daySchedules.map(({ schedule, index }) => (
                            <li key={`${schedule.title}-${schedule.date}-${index}`}>
                              <div>
                                <span>
                                  {schedule.startTime}-{schedule.endTime}
                                </span>
                                <strong>{schedule.title}</strong>
                              </div>
                              <div className="inline-actions">
                                <button
                                  type="button"
                                  onClick={() => startEditSchedule(index)}
                                >
                                  編集
                                </button>
                                <button
                                  className="danger-button"
                                  type="button"
                                  onClick={() => handleDeleteSchedule(index)}
                                >
                                  削除
                                </button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div>
                      <h3>締切タスク</h3>
                      {dayTasks.length === 0 ? (
                        <p className="muted-text">締切タスクはありません。</p>
                      ) : (
                        <ul className="compact-list">
                          {dayTasks.map((task, index) => (
                            <li key={`${task.name}-${task.deadline}-${index}`}>
                              <span>{task.completed ? "完了" : "未完了"}</span>
                              <strong>{task.name}</strong>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </section>
    </main>
  );
}

export default Calendar;
