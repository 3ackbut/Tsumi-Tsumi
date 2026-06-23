import { Link } from "react-router-dom";
import { sampleSchedules, sampleTasks } from "../data/sampleData";

function Calendar() {
  const dates = Array.from(
    new Set([
      ...sampleSchedules.map((schedule) => schedule.date),
      ...sampleTasks.map((task) => task.deadline),
    ]),
  ).sort();

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
            <p className="eyebrow">Schedule</p>
            <h2>日付別の予定とタスク</h2>
          </div>
        </div>

        <div className="day-list">
          {dates.map((date) => {
            const schedules = sampleSchedules.filter(
              (schedule) => schedule.date === date,
            );
            const tasks = sampleTasks.filter((task) => task.deadline === date);

            return (
              <article className="day-card" key={date}>
                <div className="day-date">{date}</div>

                <div className="day-content">
                  <div>
                    <h3>予定</h3>
                    {schedules.length === 0 ? (
                      <p className="muted-text">予定はありません。</p>
                    ) : (
                      <ul className="compact-list">
                        {schedules.map((schedule) => (
                          <li key={schedule.title}>
                            <span>
                              {schedule.startTime}-{schedule.endTime}
                            </span>
                            <strong>{schedule.title}</strong>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div>
                    <h3>締切タスク</h3>
                    {tasks.length === 0 ? (
                      <p className="muted-text">締切タスクはありません。</p>
                    ) : (
                      <ul className="compact-list">
                        {tasks.map((task) => (
                          <li key={task.name}>
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
          })}
        </div>
      </section>
    </main>
  );
}

export default Calendar;
