import { useState } from "react";
import { Link } from "react-router-dom";
import { useAppData } from "../hooks/useAppData";
import type { DiagnosisResult } from "../types/diagnosis";

type DiagnosisType = "計画型" | "締切集中型" | "気分変動型" | "コツコツ型";

interface DiagnosisOption {
  label: string;
  type: DiagnosisType;
}

interface DiagnosisQuestion {
  text: string;
  options: DiagnosisOption[];
}

const questions: DiagnosisQuestion[] = [
  {
    text: "タスクが増えたとき、最初にしがちな行動は？",
    options: [
      { label: "期限や量を見て計画表を作る", type: "計画型" },
      { label: "締切が近いものから一気に進める", type: "締切集中型" },
      { label: "気分が乗るものから選ぶ", type: "気分変動型" },
      { label: "小さい作業を少しずつ片付ける", type: "コツコツ型" },
    ],
  },
  {
    text: "一番集中しやすいタイミングは？",
    options: [
      { label: "予定通りに始められたとき", type: "計画型" },
      { label: "期限が迫って危機感があるとき", type: "締切集中型" },
      { label: "やる気が出ているとき", type: "気分変動型" },
      { label: "いつもの時間になったとき", type: "コツコツ型" },
    ],
  },
  {
    text: "苦手なタスクに向き合うとき、近いものは？",
    options: [
      { label: "手順に分けてから進める", type: "計画型" },
      { label: "締切前にまとめて突破する", type: "締切集中型" },
      { label: "気分が軽い日に取りかかる", type: "気分変動型" },
      { label: "短い時間だけ毎日触る", type: "コツコツ型" },
    ],
  },
  {
    text: "タスク管理アプリに一番欲しい表示は？",
    options: [
      { label: "優先順位と予定の見通し", type: "計画型" },
      { label: "締切までの残り時間", type: "締切集中型" },
      { label: "今日の気分に合うタスク", type: "気分変動型" },
      { label: "連続達成や進捗の記録", type: "コツコツ型" },
    ],
  },
  {
    text: "予定外の用事が入ったときは？",
    options: [
      { label: "計画を組み直して調整する", type: "計画型" },
      { label: "締切が近いものだけ守る", type: "締切集中型" },
      { label: "その日の調子で進め方を変える", type: "気分変動型" },
      { label: "最低限の小さな作業だけ続ける", type: "コツコツ型" },
    ],
  },
  {
    text: "達成感を感じやすいのは？",
    options: [
      { label: "予定通りに終わったとき", type: "計画型" },
      { label: "締切直前に間に合ったとき", type: "締切集中型" },
      { label: "楽しく勢いよく進められたとき", type: "気分変動型" },
      { label: "毎日少しずつ続けられたとき", type: "コツコツ型" },
    ],
  },
  {
    text: "次に改善したいタスク管理の課題は？",
    options: [
      { label: "先の見通しをもっと立てたい", type: "計画型" },
      { label: "締切前に焦りすぎないようにしたい", type: "締切集中型" },
      { label: "気分の波に振り回されにくくしたい", type: "気分変動型" },
      { label: "続ける仕組みを作りたい", type: "コツコツ型" },
    ],
  },
];

const diagnosisDetails: Record<
  DiagnosisType,
  Omit<DiagnosisResult, "typeName" | "diagnosedAt">
> = {
  計画型: {
    description:
      "全体像をつかみ、締切や作業量を整理してから進めると力を発揮しやすいタイプです。",
    feature:
      "優先順位やスケジュールが見えていると安心して進められます。一方で、計画作りに時間を使いすぎると着手が遅れることがあります。",
    recommendation:
      "まず今日やるタスクを3つに絞り、見積時間を決めてから取りかかるのがおすすめです。",
  },
  締切集中型: {
    description:
      "期限が近づくほど集中力が上がり、短時間で一気に進める力があるタイプです。",
    feature:
      "追い込みには強いですが、締切が重なると負担が大きくなりやすい傾向があります。",
    recommendation:
      "締切の前日に小さな仮締切を置き、15分だけ先に着手しておくと安定します。",
  },
  気分変動型: {
    description:
      "気分や興味の流れに乗ると、集中して楽しく進められるタイプです。",
    feature:
      "やる気がある日は大きく進みますが、気分が重い日は始めるまでに時間がかかることがあります。",
    recommendation:
      "その日の気分に合わせて、軽いタスク・集中タスク・整理タスクから選べる状態にしておくのがおすすめです。",
  },
  コツコツ型: {
    description:
      "小さな作業を積み重ね、安定して進めることが得意なタイプです。",
    feature:
      "継続力があり、進捗を記録すると達成感を得やすいです。一方で、大きな締切前には加速の工夫が必要になることがあります。",
    recommendation:
      "毎日同じ時間に10分だけ進める習慣を作り、終わった作業を見える形で記録しましょう。",
  },
};

function buildDiagnosisResult(answers: DiagnosisType[]): DiagnosisResult {
  const scores = answers.reduce<Record<DiagnosisType, number>>(
    (currentScores, answer) => ({
      ...currentScores,
      [answer]: currentScores[answer] + 1,
    }),
    {
      計画型: 0,
      締切集中型: 0,
      気分変動型: 0,
      コツコツ型: 0,
    },
  );

  const resultType = (Object.keys(scores) as DiagnosisType[]).reduce(
    (highestType, type) =>
      scores[type] > scores[highestType] ? type : highestType,
    "計画型",
  );
  const detail = diagnosisDetails[resultType];

  return {
    typeName: resultType,
    description: detail.description,
    feature: detail.feature,
    recommendation: detail.recommendation,
    diagnosedAt: new Date().toISOString(),
  };
}

function formatDiagnosedAt(value: string) {
  return new Date(value).toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Diagnosis() {
  const { diagnosisResult, saveDiagnosisResult, resetDiagnosisResult } =
    useAppData();
  const [answers, setAnswers] = useState<DiagnosisType[]>([]);

  const selectAnswer = (questionIndex: number, value: DiagnosisType) => {
    setAnswers((currentAnswers) => {
      const nextAnswers = [...currentAnswers];
      nextAnswers[questionIndex] = value;
      return nextAnswers;
    });
  };

  const answeredCount = questions.filter(
    (_, questionIndex) => answers[questionIndex] !== undefined,
  ).length;
  const isAnsweredAll = answeredCount === questions.length;

  const saveResult = () => {
    if (!isAnsweredAll) {
      return;
    }

    saveDiagnosisResult(buildDiagnosisResult(answers));
  };

  const restartDiagnosis = () => {
    resetDiagnosisResult();
    setAnswers([]);
  };

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Diagnosis</p>
          <h1>性格診断</h1>
          <p className="lead">
            7つの質問から、タスクの進め方タイプとおすすめの進め方を保存します。
          </p>
        </div>
        <Link className="text-link" to="/">
          ホームへ
        </Link>
      </div>

      {diagnosisResult !== null ? (
        <section className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Saved Result</p>
              <h2>診断結果</h2>
            </div>
            <span className="status-pill">
              {formatDiagnosedAt(diagnosisResult.diagnosedAt)}
            </span>
          </div>

          <div className="result-box result-box-large">
            <strong>{diagnosisResult.typeName}</strong>
            <p>{diagnosisResult.description}</p>

            <div className="result-detail-grid">
              <div>
                <span>学習・タスク管理の特徴</span>
                <p>{diagnosisResult.feature}</p>
              </div>
              <div>
                <span>おすすめの進め方</span>
                <p>{diagnosisResult.recommendation}</p>
              </div>
            </div>
          </div>

          <button
            className="primary-button"
            type="button"
            onClick={restartDiagnosis}
          >
            再診断
          </button>
        </section>
      ) : (
        <>
          <section className="panel">
            <div className="question-list">
              {questions.map((question, questionIndex) => (
                <article className="question-card" key={question.text}>
                  <h2>
                    Q{questionIndex + 1}. {question.text}
                  </h2>
                  <div className="choice-row">
                    {question.options.map((option) => (
                      <button
                        className={
                          answers[questionIndex] === option.type
                            ? "choice-button is-selected"
                            : "choice-button"
                        }
                        type="button"
                        key={option.label}
                        onClick={() => selectAnswer(questionIndex, option.type)}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="panel">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Progress</p>
                <h2>回答状況</h2>
              </div>
              <span className="status-pill">
                {answeredCount}/{questions.length}回答
              </span>
            </div>

            <p className="muted-text">
              すべての質問に回答すると、診断結果を保存できます。
            </p>

            <button
              className="primary-button"
              type="button"
              onClick={saveResult}
              disabled={!isAnsweredAll}
            >
              診断結果を保存
            </button>
          </section>
        </>
      )}
    </main>
  );
}

export default Diagnosis;
