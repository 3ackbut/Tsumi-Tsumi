/*
 * ファイル名: Calendar.tsx
 * 作成者: やわらか背骨チャンネル
 * 初版作成日: 2026年6月15日
 * 最終更新日: 2026年6月26日
 *
 * 概要:
 * 予定の追加・編集・削除と、週間カレンダー表示を行う画面。
 * 今日の強調表示と、未来日を基準にした推定つみ度の表示も担当する。
 *
 * 変更履歴:
 * 2026年6月15日  カレンダー画面を作成
 * 2026年6月23日  予定の追加・編集・削除機能を追加
 * 2026年6月23日  週間カレンダーと推定つみ度を追加
 * 2026年6月26日  今日の日付強調表示を追加
 * 2026年6月26日  コード規約に沿ったコメントを追加
 * 2026年6月26日  ソースコードヘッダを追加
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { useAppData } from "../hooks/useAppData";
import type { Schedule } from "../types/schedule";
import { calculateTsumiScore } from "../utils/tsumiScore";

const dayLabels = ["日", "月", "火", "水", "木", "金", "土"];

function formatDate(date: Date) {
  return date.toLocaleDateString("sv-SE");
}

function formatDisplayDate(date: Date) {
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function formatJapaneseDate(date: Date) {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

function getStartOfWeek(date: Date) {
  // 週間表示は日曜始まりにそろえる。どの日に開いても同じ週の7日分を表示するため。
  const startOfWeek = new Date(date);
  startOfWeek.setHours(0, 0, 0, 0);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

  return startOfWeek;
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);

  return nextDate;
}

function isSameDate(firstDate: Date, secondDate: Date) {
  return formatDate(firstDate) === formatDate(secondDate);
}

function buildForecastReason(item: ReturnType<typeof calculateTsumiScore>) {
  const { overdueTaskCount, upcomingDeadlineTaskCount } = item.breakdown;

  if (overdueTaskCount > 0) {
    return "期限切れが増えています";
  }

  if (upcomingDeadlineTaskCount > 0) {
    return "締切が近いタスクがあります";
  }

  if (item.score >= 25) {
    return "未完了タスクが積み上がっています";
  }

  return "まだ余裕があります";
}

function Calendar() {
  const {
    tasks,
    diagnosisResult,
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
  const today = new Date();
  // 週の開始日をStateで持つことで、「前の週」「次の週」ボタンで表示週を切り替えられる。
  const [weekStartDate, setWeekStartDate] = useState(() =>
    getStartOfWeek(today),
  );
  // 週の開始日から7日分のDateを作り、週間カレンダーの列として表示する。
  const weekDates = Array.from({ length: 7 }, (_, index) =>
    addDays(weekStartDate, index),
  );
  const weekEndDate = addDays(weekStartDate, 6);
  // 未来の日付を基準日に渡し、未完了タスクが残った場合の締切超過を予測に反映する。
  const forecastTargets = [
    { label: "今日", date: today },
    { label: "1日後", date: addDays(today, 1) },
    { label: "3日後", date: addDays(today, 3) },
    { label: "7日後", date: addDays(today, 7) },
  ];
  const forecastItems = forecastTargets.map((forecastTarget) => ({
    ...forecastTarget,
    // Calendarでは予測対象日を基準日に渡し、締切が近づく・過ぎる変化を反映する。
    tsumiScore: calculateTsumiScore(
      tasks,
      diagnosisResult,
      forecastTarget.date,
    ),
  }));

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

  const moveWeek = (weekOffset: number) => {
    // 現在表示中の週開始日に7日単位で足し引きし、前後の週へ移動する。
    setWeekStartDate((currentWeekStartDate) =>
      addDays(currentWeekStartDate, weekOffset * 7),
    );
  };

  const moveToThisWeek = () => {
    // 今日を含む週に戻すため、現在日時から週の開始日を計算し直す。
    setWeekStartDate(getStartOfWeek(new Date()));
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
            <p className="eyebrow">Forecast</p>
            <h2>推定つみ度</h2>
          </div>
        </div>
        <p className="muted-text forecast-description">
          現在の未完了タスクが残った場合のつみ度予測です。
        </p>

        <div className="forecast-grid">
          {forecastItems.map((item) => (
            <div className="forecast-card" key={item.label}>
              <span>{item.label}</span>
              <strong>{item.tsumiScore.score}</strong>
              <p>{item.tsumiScore.label}</p>
              <div className="forecast-breakdown">
                <small>
                  期限切れ: {item.tsumiScore.breakdown.overdueTaskCount}件
                </small>
                <small>
                  3日以内: {item.tsumiScore.breakdown.upcomingDeadlineTaskCount}
                  件
                </small>
              </div>
              <p className="forecast-reason">
                理由: {buildForecastReason(item.tsumiScore)}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Weekly</p>
            <h2>週間カレンダー</h2>
          </div>
          <span className="status-pill">
            {formatJapaneseDate(weekStartDate)}〜{formatJapaneseDate(weekEndDate)}
          </span>
        </div>

        <div className="week-controls">
          <span className="week-range">
            表示中: {formatJapaneseDate(weekStartDate)}〜
            {formatJapaneseDate(weekEndDate)}
          </span>
          <button type="button" onClick={() => moveWeek(-1)}>
            前の週
          </button>
          <button type="button" onClick={moveToThisWeek}>
            今週
          </button>
          <button type="button" onClick={() => moveWeek(1)}>
            次の週
          </button>
        </div>

        <div className="weekly-grid">
          {weekDates.map((dateItem) => {
            const dateKey = formatDate(dateItem);
            // 予定とタスクは日付文字列で保存しているため、表示用Dateを保存形式に変換して照合する。
            // 今日だけ背景とバッジを変え、ユーザーが現在日をすぐ見つけられるようにする。
            const isToday = isSameDate(dateItem, today);
            const daySchedules = schedules
              .map((schedule, index) => ({ schedule, index }))
              .filter(({ schedule }) => schedule.date === dateKey);
            const dayTasks = tasks.filter((task) => task.deadline === dateKey);

            return (
              <article
                className={`week-day-card${isToday ? " today-week-card" : ""}`}
                key={dateKey}
              >
                <div className="week-day-header">
                  <div>
                    <span>{dayLabels[dateItem.getDay()]}</span>
                    {isToday && <em>今日</em>}
                  </div>
                  <strong>{formatDisplayDate(dateItem)}</strong>
                </div>

                <div className="week-day-section">
                  <h3>予定</h3>
                  {daySchedules.length === 0 ? (
                    <p className="muted-text">なし</p>
                  ) : (
                    <ul className="week-item-list">
                      {daySchedules.map(({ schedule, index }) => (
                        <li className="week-item schedule-item" key={`${schedule.title}-${index}`}>
                          <span>
                            {schedule.startTime}-{schedule.endTime}
                          </span>
                          <strong>{schedule.title}</strong>
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

                <div className="week-day-section">
                  <h3>締切</h3>
                  {dayTasks.length === 0 ? (
                    <p className="muted-text">なし</p>
                  ) : (
                    <ul className="week-item-list">
                      {dayTasks.map((task, index) => (
                        <li className="week-item task-deadline-item" key={`${task.name}-${index}`}>
                          <span>{task.completed ? "完了" : "未完了"}</span>
                          <strong>{task.name}</strong>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}

export default Calendar;
