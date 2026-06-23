import type { DiagnosisResult } from "../types/diagnosis";
import type { Task } from "../types/task";
import { judgeAutoPriority, type AutoPriorityLevel } from "./taskPriority";

export interface TsumiScoreResult {
  score: number;
  label: string;
  message: string;
}

const autoPriorityWeight: Record<AutoPriorityLevel, number> = {
  高: 18,
  中: 10,
  低: 4,
};

function getDaysUntilDeadline(deadline: string) {
  const today = new Date();
  const todayDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const deadlineDate = new Date(`${deadline}T00:00:00`);
  const diffMilliseconds = deadlineDate.getTime() - todayDate.getTime();

  return Math.ceil(diffMilliseconds / (1000 * 60 * 60 * 24));
}

function getDeadlineWeight(daysUntilDeadline: number) {
  if (daysUntilDeadline < 0) {
    return 28;
  }

  if (daysUntilDeadline <= 1) {
    return 24;
  }

  if (daysUntilDeadline <= 3) {
    return 16;
  }

  if (daysUntilDeadline <= 7) {
    return 8;
  }

  return 2;
}

function getEstimatedMinutesWeight(estimatedMinutes: number) {
  if (estimatedMinutes >= 180) {
    return 16;
  }

  if (estimatedMinutes >= 120) {
    return 12;
  }

  if (estimatedMinutes >= 60) {
    return 7;
  }

  return 3;
}

function getLabel(score: number) {
  if (score >= 80) {
    return "かなり危険";
  }

  if (score >= 60) {
    return "注意";
  }

  if (score >= 30) {
    return "少し積み気味";
  }

  return "余裕あり";
}

function getMessage(score: number) {
  if (score >= 80) {
    return "未完了タスクがかなり積み上がっています。期限切れや優先度の高いタスクからすぐに確認しましょう。";
  }

  if (score >= 60) {
    return "タスクが積み上がり始めています。締切が近いものから順番に減らすのがおすすめです。";
  }

  if (score >= 30) {
    return "少し積み気味です。短時間で終わるタスクを先に片付けると余裕が戻ります。";
  }

  return "まだ余裕があります。今のうちに重要度の高いタスクを少し進めておくと安心です。";
}

export function calculateTsumiScore(
  tasks: Task[],
  diagnosisResult: DiagnosisResult | null,
): TsumiScoreResult {
  const incompleteTasks = tasks.filter((task) => !task.completed);

  if (incompleteTasks.length === 0) {
    return {
      score: 0,
      label: "余裕あり",
      message: "未完了タスクはありません。今はかなり余裕がある状態です。",
    };
  }

  const rawScore = incompleteTasks.reduce((total, task) => {
    const autoPriority = judgeAutoPriority(task, diagnosisResult);
    const daysUntilDeadline = getDaysUntilDeadline(task.deadline);
    const taskScore =
      task.importance * 6 +
      autoPriorityWeight[autoPriority.level] +
      getDeadlineWeight(daysUntilDeadline) +
      getEstimatedMinutesWeight(task.estimatedMinutes);

    return total + taskScore;
  }, 0);
  const score = Math.min(100, Math.round(rawScore));

  return {
    score,
    label: getLabel(score),
    message: getMessage(score),
  };
}
