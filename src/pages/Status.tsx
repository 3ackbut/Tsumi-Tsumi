import { Link } from "react-router-dom";
import { useAppData } from "../hooks/useAppData";
import { calculateTsumiScore } from "../utils/tsumiScore";

function Status() {
  const { tasks, diagnosisResult } = useAppData();
  const completedCount = tasks.filter((task) => task.completed).length;
  const incompleteCount = tasks.length - completedCount;
  const achievementRate =
    tasks.length === 0 ? 0 : Math.round((completedCount / tasks.length) * 100);
  const remainingMinutes = tasks
    .filter((task) => !task.completed)
    .reduce((total, task) => total + task.estimatedMinutes, 0);
  const tsumiScore = calculateTsumiScore(tasks, diagnosisResult);

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Status</p>
          <h1>積み上げ状況</h1>
          <p className="lead">
            つみ度は高いほどタスクが積み上がっていて注意が必要な状態を表します。
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
            <strong>{tsumiScore.score}%</strong>
            <span className="tsumi-label">{tsumiScore.label}</span>
          </div>
          <p>{tsumiScore.message}</p>
        </div>

        <div className="meter" aria-label={`つみ度 ${tsumiScore.score}%`}>
          <span style={{ width: `${tsumiScore.score}%` }} />
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
