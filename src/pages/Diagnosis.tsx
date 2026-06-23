import { useState } from "react";
import { Link } from "react-router-dom";

const questions = [
  {
    text: "締切が近いタスクがあるとき、どちらに近いですか？",
    options: [
      { label: "先に計画を立てる", value: "planner" },
      { label: "まず手を動かす", value: "starter" },
    ],
  },
  {
    text: "タスクが多い日は、どちらが助かりますか？",
    options: [
      { label: "優先順位が見える", value: "planner" },
      { label: "短時間でできるものが見える", value: "starter" },
    ],
  },
  {
    text: "やる気が出ないとき、始めやすいのは？",
    options: [
      { label: "締切が近いもの", value: "planner" },
      { label: "5分で終わるもの", value: "starter" },
    ],
  },
];

function Diagnosis() {
  const [answers, setAnswers] = useState<string[]>([]);

  const selectAnswer = (questionIndex: number, value: string) => {
    setAnswers((currentAnswers) => {
      const nextAnswers = [...currentAnswers];
      nextAnswers[questionIndex] = value;
      return nextAnswers;
    });
  };

  const plannerCount = answers.filter((answer) => answer === "planner").length;
  const answeredCount = questions.filter(
    (_, questionIndex) => answers[questionIndex] !== undefined,
  ).length;
  const isAnsweredAll = answeredCount === questions.length;
  const result =
    !isAnsweredAll
      ? undefined
      : plannerCount >= 2
        ? {
            type: "計画重視タイプ",
            description:
              "優先順位や締切を整理すると力を出しやすいタイプです。",
            recommendation: "今日中に、優先度5のタスクから25分だけ進める",
          }
        : {
            type: "着手重視タイプ",
            description:
              "小さく始めることで勢いを作りやすいタイプです。",
            recommendation: "5分でできる見直しや資料整理から始める",
          };

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Diagnosis</p>
          <h1>性格診断</h1>
          <p className="lead">
            3つの質問から、タスクの進め方タイプとおすすめタスク例を表示します。
          </p>
        </div>
        <Link className="text-link" to="/">
          ホームへ
        </Link>
      </div>

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
                      answers[questionIndex] === option.value
                        ? "choice-button is-selected"
                        : "choice-button"
                    }
                    type="button"
                    key={option.label}
                    onClick={() => selectAnswer(questionIndex, option.value)}
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
            <p className="eyebrow">Result</p>
            <h2>診断結果</h2>
          </div>
          <span className="status-pill">{answeredCount}/3回答</span>
        </div>

        {result === undefined ? (
          <p className="muted-text">すべての質問に回答すると結果が表示されます。</p>
        ) : (
          <div className="result-box">
            <strong>{result.type}</strong>
            <p>{result.description}</p>
            <div>
              <span>おすすめタスク例</span>
              <p>{result.recommendation}</p>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

export default Diagnosis;
