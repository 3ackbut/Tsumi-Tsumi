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
  const referenceDate = baseDate ?? new Date();
  const daysUntilDeadline = getDaysUntilDeadline(task.deadline, referenceDate);
  const diagnosisType = diagnosisResult?.typeName ?? null;
  let score = task.importance * 12;

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

  const level: AutoPriorityLevel =
    score >= 70 ? "高" : score >= 42 ? "中" : "低";

  return {
    level,
    reason: buildReason(task, daysUntilDeadline, diagnosisType, level),
  };
}
