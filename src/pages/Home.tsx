/*
 * ファイル名: Home.tsx
 * 作成者: やわらか背骨チャンネル
 * 初版作成日: 2026年6月15日
 * 最終更新日: 2026年6月26日
 *
 * 概要:
 * アプリのホーム画面を表示する。
 * 今日の日付、今日のタスク・予定、つみ度、診断結果に応じた行動コメントをまとめて表示する。
 *
 * 変更履歴:
 * 2026年6月15日  ホーム画面を作成
 * 2026年6月23日  タスク・予定・診断結果の表示を追加
 * 2026年6月23日  つみ度表示と行動コメントを追加
 * 2026年6月26日  今日の日付表示を追加
 * 2026年6月26日  ソースコードヘッダを追加
 */

import "../App.css";
import { Link } from "react-router-dom";
import { useAppData } from "../hooks/useAppData";
import { getHomeAdvice } from "../utils/homeAdvice";
import { calculateTsumiScore } from "../utils/tsumiScore";

function formatDate(date: Date) {
  return date.toLocaleDateString("sv-SE");
}

function formatJapaneseDate(date: Date) {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(date);
}

function Home() {
  const { tasks, schedules, diagnosisResult } = useAppData();
  const todayDate = new Date();
  const today = formatDate(todayDate);
  const todayTasks = tasks.filter((task) => task.deadline === today);
  const todaySchedules = schedules.filter(
    (schedule) => schedule.date === today,
  );
  const incompleteTasks = tasks.filter((task) => !task.completed);
  const completedTasks = tasks.filter((task) => task.completed);
  const tsumiScore = calculateTsumiScore(tasks, diagnosisResult);
  const homeAdvice = getHomeAdvice(diagnosisResult, tsumiScore.score);

  return (
    <main className="page">
      <section className="hero home-hero">
        <p className="eyebrow">タスク管理・つみ度可視化システム</p>
        <h1>Tsumi-Tsumi</h1>
        <p className="lead">
          つみ度は高いほど、未完了タスクが積み上がっていて注意が必要な状態を表します。
        </p>
      </section>

      <section className="tsumi-focus-panel">
        <div className="today-status-header">
          <div>
            <p className="eyebrow">Today</p>
            <h2>今日の状況</h2>
          </div>
          <time dateTime={today}>{formatJapaneseDate(todayDate)}</time>
        </div>

        <div className="tsumi-focus-content">
          <div>
            <p className="eyebrow">Current Tsumi</p>
            <h2>現在のつみ度</h2>
            <p className="tsumi-focus-message">{tsumiScore.message}</p>
            <div className="home-advice">
              <span>次の一手</span>
              <p>{homeAdvice}</p>
            </div>
          </div>

          <div className="tsumi-score-display">
            <strong>{tsumiScore.score}%</strong>
            <span>{tsumiScore.label}</span>
          </div>
        </div>

        <div className="home-summary-grid">
          <div>
            <span>今日のタスク</span>
            <strong>{todayTasks.length}</strong>
          </div>
          <div>
            <span>未完了</span>
            <strong>{incompleteTasks.length}</strong>
          </div>
          <div>
            <span>完了</span>
            <strong>{completedTasks.length}</strong>
          </div>
          <div>
            <span>今日の予定</span>
            <strong>{todaySchedules.length}</strong>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="two-column">
          <div>
            <h3>今日のタスク</h3>
            {todayTasks.length === 0 ? (
              <p className="muted-text">今日締切のタスクはありません。</p>
            ) : (
              <ul className="compact-list">
                {todayTasks.map((task, index) => (
                  <li key={`${task.name}-${task.deadline}-${index}`}>
                    <span>{task.completed ? "完了" : "未完了"}</span>
                    <strong>{task.name}</strong>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h3>今日の予定</h3>
            {todaySchedules.length === 0 ? (
              <p className="muted-text">今日の予定はありません。</p>
            ) : (
              <ul className="compact-list">
                {todaySchedules.map((schedule, index) => (
                  <li key={`${schedule.title}-${schedule.date}-${index}`}>
                    <span>
                      {schedule.startTime}-{schedule.endTime}
                    </span>
                    <strong>{schedule.title}</strong>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Next Action</p>
            <h2>次に見る画面</h2>
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
            <p>
              {diagnosisResult === null
                ? "未診断: タイプを確認"
                : `${diagnosisResult.typeName}: 結果を見る`}
            </p>
          </Link>
        </div>
      </section>
    </main>
  );
}

export default Home;
