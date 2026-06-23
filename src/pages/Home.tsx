import "../App.css";
import { Link } from "react-router-dom";
import { sampleSchedules, sampleTasks } from "../data/sampleData";

function Home() {
  const today = "2026-06-23";
  const todayTasks = sampleTasks.filter((task) => task.deadline === today);
  const todaySchedules = sampleSchedules.filter(
    (schedule) => schedule.date === today,
  );
  const incompleteTasks = sampleTasks.filter((task) => !task.completed);
  const priorityLoad = incompleteTasks.reduce(
    (total, task) => total + task.priority * 8 + task.estimatedMinutes / 12,
    0,
  );
  const tsumido = Math.min(100, Math.round(25 + priorityLoad));

  return (
    <main className="page">
      <section className="hero">
        <p className="eyebrow">タスク管理・つみ度可視化システム</p>
        <h1>Tsumi-Tsumi</h1>
        <p className="lead">
          タスク、予定、忙しさをひとつの画面で確認し、今日やることを整理するためのWebアプリです。
        </p>
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Today</p>
            <h2>今日の状況</h2>
          </div>
          <span className="status-pill">サンプル表示</span>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <span>今日のタスク</span>
            <strong>{todayTasks.length}件</strong>
          </div>
          <div className="stat-card">
            <span>未完了</span>
            <strong>{incompleteTasks.length}件</strong>
          </div>
          <div className="stat-card stat-card-accent">
            <span>つみ度</span>
            <strong>{tsumido}%</strong>
          </div>
        </div>

        <div className="two-column">
          <div>
            <h3>今日のタスク</h3>
            <ul className="compact-list">
              {todayTasks.map((task) => (
                <li key={task.name}>
                  <span>{task.completed ? "完了" : "未完了"}</span>
                  <strong>{task.name}</strong>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3>今日の予定</h3>
            <ul className="compact-list">
              {todaySchedules.map((schedule) => (
                <li key={schedule.title}>
                  <span>
                    {schedule.startTime}-{schedule.endTime}
                  </span>
                  <strong>{schedule.title}</strong>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Menu</p>
            <h2>機能メニュー</h2>
          </div>
        </div>

        <div className="menu-grid">
          <Link className="menu-card" to="/tasks">
            <span>タスク確認</span>
            <p>追加、削除、完了切り替え</p>
          </Link>
          <Link className="menu-card" to="/calendar">
            <span>カレンダー</span>
            <p>日付ごとの予定とタスク</p>
          </Link>
          <Link className="menu-card" to="/status">
            <span>積み上げ状況</span>
            <p>つみ度と達成率を確認</p>
          </Link>
          <Link className="menu-card" to="/diagnosis">
            <span>診断</span>
            <p>タイプ別のおすすめタスク</p>
          </Link>
        </div>
      </section>
    </main>
  );
}

export default Home;
