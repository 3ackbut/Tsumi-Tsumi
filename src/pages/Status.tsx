/*
 * ファイル名: Status.tsx
 * 作成者: やわらか背骨チャンネル
 * 初版作成日: 2026年6月15日
 * 最終更新日: 2026年7月2日
 *
 * 概要:
 * タスクの完了状況とつみ度を確認する画面。
 * つみ度が高くなっている理由や、影響している未完了タスクを表示する。
 *
 * 変更履歴:
 * 2026年6月15日  状況確認画面を作成
 * 2026年6月23日  タスク保存データを使った状況表示を追加
 * 2026年6月23日  つみ度を未完了タスクの危険度として表示
 * 2026年6月23日  つみ度の理由と影響タスク表示を追加
 * 2026年6月26日  ソースコードヘッダを追加
 * 2026年7月2日  Issue #39 つみ度情報の表示を整理
 * 2026年7月2日  Issue #39 つみ度カードの状態ラベル表示を調整
 * 2026年7月2日  Issue #39 つみ度ゲージ色を状態別に調整
 * 2026年7月3日  Issue #31 診断結果に合わせた進め方カードを追加
 */

import { Link } from "react-router-dom";
import { useAppData } from "../hooks/useAppData";
import type { DiagnosisResult } from "../types/diagnosis";
import { calculateTsumiScore } from "../utils/tsumiScore";

function getStatusLabel(score: number) {
  if (score >= 81) {
    return "危険";
  }

  if (score >= 61) {
    return "注意";
  }

  if (score >= 31) {
    return "少し積み気味";
  }

  return "余裕あり";
}

function getStatusLevel(score: number) {
  if (score >= 81) {
    return "danger";
  }

  if (score >= 61) {
    return "warning";
  }

  if (score >= 31) {
    return "stacked";
  }

  return "relaxed";
}

function getPersonalizedAdvice(
  diagnosisResult: DiagnosisResult | null,
  score: number,
) {
  const isHigh = score >= 50;

  if (diagnosisResult === null) {
    return {
      typeName: "未診断",
      advice:
        "診断を行うと、あなたの進め方に合わせたアドバイスが表示されます。",
    };
  }

  switch (diagnosisResult.typeName) {
    case "計画型":
      return {
        typeName: diagnosisResult.typeName,
        advice: isHigh
          ? "計画を立てて進めやすいタイプです。つみ度が高めなので、今日やるタスクを小さく分けて、締切が近いものから予定に入れていきましょう。"
          : "計画を立てて進めやすいタイプです。つみ度が上がる前に、今日やるタスクを小さく分けて予定に入れておくと安定して進められます。",
      };
    case "締切集中型":
      return {
        typeName: diagnosisResult.typeName,
        advice: isHigh
          ? "締切が近いほど集中しやすいタイプです。つみ度が高めなので、短時間で終わるタスクから先に片付けて、締切前の負担を減らしましょう。"
          : "締切が近いほど集中しやすいタイプです。つみ度が上がりすぎる前に、短時間で終わるタスクから先に片付けると負担を減らせます。",
      };
    case "気分変動型":
      return {
        typeName: diagnosisResult.typeName,
        advice: isHigh
          ? "その日の気分や調子に左右されやすいタイプです。つみ度が高い日は、重いタスクよりも始めやすいタスクから取りかかるのがおすすめです。"
          : "その日の気分や調子に左右されやすいタイプです。つみ度が低いうちは、気分が軽いタスクを先に進めておくと流れを作りやすくなります。",
      };
    case "コツコツ型":
      return {
        typeName: diagnosisResult.typeName,
        advice: isHigh
          ? "少しずつ積み上げるのが得意なタイプです。つみ度が高めなので、タスクをさらに小さく分けて、今すぐ進められる一歩から減らしていきましょう。"
          : "少しずつ積み上げるのが得意なタイプです。つみ度が低いうちに、毎日少しだけ進めるタスクを決めておくと安定して進められます。",
      };
    default:
      return {
        typeName: diagnosisResult.typeName,
        advice:
          "診断結果をもとに、今のつみ度に合わせて無理なく進められるタスクから取りかかりましょう。",
      };
  }
}

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
  const statusLabel = getStatusLabel(tsumiScore.score);
  const statusLevel = getStatusLevel(tsumiScore.score);
  const personalizedAdvice = getPersonalizedAdvice(
    diagnosisResult,
    tsumiScore.score,
  );

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
          <div className="status-score-card">
            <p className="eyebrow">Tsumi Score</p>
            <strong>{tsumiScore.score}%</strong>
            <span className="tsumi-label">{statusLabel}</span>
            <div
              className={`meter meter-${statusLevel}`}
              aria-label={`つみ度 ${tsumiScore.score}%`}
            >
              <span style={{ width: `${tsumiScore.score}%` }} />
            </div>
            <p>{tsumiScore.message}</p>
            <p className="muted-text">
              つみ度は、未完了タスク・締切・重要度・見積時間をもとに計算しています。高いほど注意が必要です。
            </p>
          </div>
          <div className="personal-advice-card">
            <p className="eyebrow">Your Style</p>
            <h2>あなたに合った進め方</h2>
            <span className="status-pill">{personalizedAdvice.typeName}</span>
            <p>{personalizedAdvice.advice}</p>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Progress</p>
            <h2>タスクの進み具合</h2>
          </div>
        </div>

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
                    締切: {task.deadline} / 入力した重要度: {task.importance} /
                    見積: {task.estimatedMinutes}分
                  </p>
                </div>
                <div className="impact-priority">
                  <span>自動優先度</span>
                  <strong className={`priority-badge priority-${autoPriorityLevel}`}>
                    {autoPriorityLevel}
                  </strong>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

export default Status;
