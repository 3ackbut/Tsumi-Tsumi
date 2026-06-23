import { Link } from "react-router-dom";
import { useAppData } from "../hooks/useAppData";

function Status() {
  const { tasks } = useAppData();
  const completedCount = tasks.filter((task) => task.completed).length;
  const incompleteCount = tasks.length - completedCount;
  const achievementRate =
    tasks.length === 0 ? 0 : Math.round((completedCount / tasks.length) * 100);
  const remainingMinutes = tasks
    .filter((task) => !task.completed)
    .reduce((total, task) => total + task.estimatedMinutes, 0);
  const importanceScore = tasks
    .filter((task) => !task.completed)
    .reduce((total, task) => total + task.importance * 9, 0);
  const tsumido = Math.min(100, Math.round(20 + remainingMinutes / 8 + importanceScore));
  const comment =
    tsumido >= 80
      ? "かなり積み上がっています。重要度の高いタスクから先に片付けましょう。"
      : tsumido >= 50
        ? "少し忙しい状態です。今日できる量に分けると進めやすくなります。"
        : "余裕があります。早めに進めると安心です。";

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Status</p>
          <h1>積み上げ状況</h1>
          <p className="lead">
            タスクの残量と達成状況から、現在のつみ度を簡易計算しています。
          </p>
        </div>
        <Link className="text-link" to="/">
          ホームへ
        </Link>
      </div>

      <section className="panel">
        <div className="status-hero">
          <div>
            <p className="eyebrow">Tsumi Score</p>
            <strong>{tsumido}%</strong>
          </div>
          <p>{comment}</p>
        </div>

        <div className="meter" aria-label={`つみ度 ${tsumido}%`}>
          <span style={{ width: `${tsumido}%` }} />
        </div>
      </section>

      <section className="panel">
        <div className="stats-grid">
          <div className="stat-card">
            <span>完了数</span>
            <strong>{completedCount}件</strong>
          </div>
          <div className="stat-card">
            <span>未完了数</span>
            <strong>{incompleteCount}件</strong>
          </div>
          <div className="stat-card">
            <span>達成率</span>
            <strong>{achievementRate}%</strong>
          </div>
          <div className="stat-card">
            <span>残り見積</span>
            <strong>{remainingMinutes}分</strong>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Status;
