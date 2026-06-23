import type { DiagnosisResult } from "../types/diagnosis";

function isTsumiHigh(score: number) {
  return score >= 50;
}

export function getHomeAdvice(
  diagnosisResult: DiagnosisResult | null,
  tsumiScore: number,
) {
  const isHigh = isTsumiHigh(tsumiScore);

  if (diagnosisResult === null) {
    return isHigh
      ? "現在のつみ度に応じて未完了タスクを整理しましょう。診断を行うと、より自分に合ったコメントが表示されます。"
      : "余裕があるうちに未完了タスクを確認しましょう。診断を行うと、より自分に合ったコメントが表示されます。";
  }

  switch (diagnosisResult.typeName) {
    case "計画型":
      return isHigh
        ? "締切が近いものから順番に並べて、今日やる分だけ決めましょう。"
        : "今のペースを維持しましょう。次の締切を確認しておくと安心です。";
    case "締切集中型":
      return isHigh
        ? "まず今日中に終わらせるタスクを1つ選び、短時間だけ着手しましょう。"
        : "余裕があるうちに、締切が近いタスクを1つだけ進めておきましょう。";
    case "気分変動型":
      return isHigh
        ? "5〜15分で終わる小さいタスクから始めて、負担感を減らしましょう。"
        : "余裕があるので、気分が乗るタスクから軽く進めましょう。";
    case "コツコツ型":
      return isHigh
        ? "タスクを小さく分けて、15〜30分で進められるものから片づけましょう。"
        : "今の積み重ねを続けましょう。小さいタスクを先に片づけると安定します。";
    default:
      return "現在のつみ度に応じて未完了タスクを整理しましょう。";
  }
}
