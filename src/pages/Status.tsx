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

      <section className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Reasons</p>
            <h2>つみ度が高くなっている理由</h2>
          </div>
        </div>

        <ul className="reason-list">
          {tsumiScore.reasons.map((reason) => (
            <li key={reason}>{reason}</li>
          ))}
        </ul>
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Impact Tasks</p>
            <h2>つみ度に影響しているタスク</h2>
          </div>
          <span className="status-pill">
            最大{tsumiScore.influentialTasks.length}件
          </span>
        </div>

        {tsumiScore.influentialTasks.length === 0 ? (
          <div className="empty-state">
            <strong>影響している未完了タスクはありません。</strong>
            <p>未完了タスクがないため、つみ度は低い状態です。</p>
          </div>
        ) : (
          <ul className="impact-task-list">
            {tsumiScore.influentialTasks.map(({ task, autoPriorityLevel }) => (
              <li key={`${task.name}-${task.deadline}`}>
                <div>
                  <strong>{task.name}</strong>
                  <p>
                    締切: {task.deadline} / 重要度: {task.importance}
                  </p>
                </div>
                <span className={`priority-badge priority-${autoPriorityLevel}`}>
                  優先度: {autoPriorityLevel}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

export default Status;
