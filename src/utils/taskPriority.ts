/*
 * ファイル名: taskPriority.ts
 * 作成者: やわらか背骨チャンネル
 * 初版作成日: 2026年6月23日
 * 最終更新日: 2026年6月26日
 *
 * 概要:
 * タスクの重要度、締切、見積時間、診断結果から自動優先度を判定する。
 * 判定結果は高・中・低の3段階とし、画面に表示する理由文も作成する。
 *
 * 変更履歴:
 * 2026年6月23日  診断結果を用いた自動優先度判定を追加
 * 2026年6月23日  Calendarの推定つみ度用に基準日指定へ対応
 * 2026年6月26日  コード規約に沿ったコメントを追加
 * 2026年6月26日  ソースコードヘッダを追加
 */

import type { DiagnosisResult } from "../types/diagnosis";
import type { Task } from "../types/task";

export type AutoPriorityLevel = "高" | "中" | "低";

export interface AutoPriorityResult {
  level: AutoPriorityLevel;
  reason: string;
}

function getDaysUntilDeadline(deadline: string, baseDate: Date) {
  const todayDate = new Date(
    baseDate.getFullYear(),
    baseDate.getMonth(),
    baseDate.getDate(),
  );
  const deadlineDate = new Date(`${deadline}T00:00:00`);
  const diffMilliseconds = deadlineDate.getTime() - todayDate.getTime();

  return Math.ceil(diffMilliseconds / (1000 * 60 * 60 * 24));
}

function buildReason(
  task: Task,
  daysUntilDeadline: number,
  diagnosisType: string | null,
  level: AutoPriorityLevel,
) {
  // 画面には点数ではなく理由文を出し、ユーザーが判定の根拠を理解できるようにする。
  if (daysUntilDeadline < 0) {
    return `締切を過ぎており、重要度も${task.importance}のため優先度が「${level}」になっています。`;
  }

  if (daysUntilDeadline <= 1 && task.importance >= 4) {
    return `締切が近く、重要度も高いため優先度が「${level}」になっています。`;
  }

  if (diagnosisType === "計画型" && daysUntilDeadline <= 5) {
    return `計画型の診断結果をふまえ、締切が少し先でも早めに着手しやすいよう優先度が「${level}」になっています。`;
  }

  if (diagnosisType === "締切集中型" && daysUntilDeadline <= 3) {
    return `締切集中型の診断結果をふまえ、締切が近いタスクの優先度が「${level}」になっています。`;
  }

  if (
    (diagnosisType === "気分変動型" || diagnosisType === "コツコツ型") &&
    task.estimatedMinutes <= 30
  ) {
    return `${diagnosisType}の診断結果をふまえ、短時間で進めやすいタスクの優先度が「${level}」になっています。`;
  }

  if (task.importance >= 4) {
    return `重要度が高いため優先度が「${level}」になっています。`;
  }

  if (task.estimatedMinutes >= 120) {
    return `見積時間が長く、早めに分けて進めたいタスクのため優先度が「${level}」になっています。`;
  }

  return `締切、重要度、見積時間を標準ルールで判定し、優先度が「${level}」になっています。`;
}

export function judgeAutoPriority(
  task: Task,
  diagnosisResult: DiagnosisResult | null,
  baseDate?: Date,
): AutoPriorityResult {
  // importanceはユーザーが入力する「重要度」、levelはアプリが計算する「優先度」として分ける。
  // Calendarの推定表示でも使うため、今日固定ではなく受け取った基準日で締切の近さを判定する。
  const referenceDate = baseDate ?? new Date();
  const daysUntilDeadline = getDaysUntilDeadline(task.deadline, referenceDate);
  const diagnosisType = diagnosisResult?.typeName ?? null;
  let score = task.importance * 12;

  // ユーザー入力の重要度に、締切・見積時間・診断タイプの特徴を足してTsumiTsumi側の優先度にする。
  if (daysUntilDeadline < 0) {
    score += 45;
  } else if (daysUntilDeadline <= 1) {
    score += 35;
  } else if (daysUntilDeadline <= 3) {
    score += 25;
  } else if (daysUntilDeadline <= 7) {
    score += 12;
  }

  if (task.estimatedMinutes >= 120) {
    score += 12;
  } else if (task.estimatedMinutes <= 30) {
    score += 4;
  }

  // 診断結果ごとに「早めに進めたい」「短時間なら着手しやすい」などの傾向を少しだけ反映する。
  if (diagnosisType === "計画型" && daysUntilDeadline <= 7) {
    score += 10;
  }

  if (diagnosisType === "締切集中型" && daysUntilDeadline <= 3) {
    score += 14;
  }

  if (
    (diagnosisType === "気分変動型" || diagnosisType === "コツコツ型") &&
    task.estimatedMinutes <= 30
  ) {
    score += 8;
  }

  // 未診断の場合は診断タイプの加点が入らず、重要度・締切・見積時間だけの標準ルールになる。
  const level: AutoPriorityLevel =
    score >= 70 ? "高" : score >= 42 ? "中" : "低";

  return {
    level,
    reason: buildReason(task, daysUntilDeadline, diagnosisType, level),
  };
}
