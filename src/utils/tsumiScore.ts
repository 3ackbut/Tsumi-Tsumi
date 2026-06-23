import type { DiagnosisResult } from "../types/diagnosis";
import type { Task } from "../types/task";
import { judgeAutoPriority, type AutoPriorityLevel } from "./taskPriority";

export interface TsumiScoreResult {
  score: number;
  label: string;
  message: string;
  reasons: string[];
  influentialTasks: TsumiInfluentialTask[];
  breakdown: TsumiScoreBreakdown;
}

export interface TsumiInfluentialTask {
  task: Task;
  autoPriorityLevel: AutoPriorityLevel;
  daysUntilDeadline: number;
  score: number;
}

export interface TsumiScoreBreakdown {
  overdueTaskCount: number;
  upcomingDeadlineTaskCount: number;
  mainReasons: string[];
}

const autoPriorityWeight: Record<AutoPriorityLevel, number> = {
  高: 18,
  中: 10,
  低: 4,
};

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

function getDeadlineWeight(daysUntilDeadline: number) {
  if (daysUntilDeadline < 0) {
    const overdueDays = Math.abs(daysUntilDeadline);

    return 30 + Math.min(overdueDays * 4, 20);
  }

  if (daysUntilDeadline === 0) {
    return 27;
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
  if (score >= 90) {
    return "限界に近い";
  }

  if (score >= 75) {
    return "かなり危険";
  }

  if (score >= 50) {
    return "注意";
  }

  if (score >= 25) {
    return "少し積み気味";
  }

  return "余裕あり";
}

function getMessage(score: number) {
  if (score >= 90) {
    return "かなり限界に近い状態です。期限切れや優先度の高いタスクをすぐに減らしましょう。";
  }

  if (score >= 75) {
    return "未完了タスクがかなり積み上がっています。期限切れや優先度の高いタスクからすぐに確認しましょう。";
  }

  if (score >= 50) {
    return "タスクが積み上がり始めています。締切が近いものから順番に減らすのがおすすめです。";
  }

  if (score >= 25) {
    return "少し積み気味です。短時間で終わるタスクを先に片付けると余裕が戻ります。";
  }

  return "まだ余裕があります。今のうちに重要度の高いタスクを少し進めておくと安心です。";
}

function getTaskCountCap(incompleteTaskCount: number) {
  if (incompleteTaskCount <= 1) {
    return 70;
  }

  if (incompleteTaskCount === 2) {
    return 82;
  }

  if (incompleteTaskCount === 3) {
    return 90;
  }

  if (incompleteTaskCount === 4) {
    return 96;
  }

  return 100;
}

function convertRawScoreToTsumiScore(
  rawScore: number,
  incompleteTaskCount: number,
) {
  const saturatedScore = 100 * (1 - Math.exp(-rawScore / 180));
  const cappedScore = Math.min(
    saturatedScore,
    getTaskCountCap(incompleteTaskCount),
  );

  return Math.round(cappedScore);
}

function buildReasons(influentialTasks: TsumiInfluentialTask[]) {
  const reasons: string[] = [];

  if (
    influentialTasks.some(
      ({ daysUntilDeadline }) => daysUntilDeadline >= 0 && daysUntilDeadline <= 3,
    )
  ) {
    reasons.push("締切が近い未完了タスクがあります。");
  }

  if (influentialTasks.some(({ daysUntilDeadline }) => daysUntilDeadline < 0)) {
    reasons.push("期限切れの未完了タスクがあります。");
  }

  if (influentialTasks.some(({ task }) => task.importance >= 4)) {
    reasons.push("重要度が高い未完了タスクがあります。");
  }

  if (influentialTasks.some(({ autoPriorityLevel }) => autoPriorityLevel === "高")) {
    reasons.push("TsumiTsumi判定で優先度が高いタスクがあります。");
  }

  if (influentialTasks.some(({ task }) => task.estimatedMinutes >= 120)) {
    reasons.push("見積時間が長い未完了タスクがあります。");
  }

  if (reasons.length === 0) {
    reasons.push("未完了タスクはありますが、すぐに危険な積み上がりではありません。");
  }

  return reasons;
}

function buildBreakdown(
  influentialTasks: TsumiInfluentialTask[],
): TsumiScoreBreakdown {
  const overdueTaskCount = influentialTasks.filter(
    ({ daysUntilDeadline }) => daysUntilDeadline < 0,
  ).length;
  const upcomingDeadlineTaskCount = influentialTasks.filter(
    ({ daysUntilDeadline }) => daysUntilDeadline >= 0 && daysUntilDeadline <= 3,
  ).length;

  return {
    overdueTaskCount,
    upcomingDeadlineTaskCount,
    mainReasons: buildReasons(influentialTasks).slice(0, 2),
  };
}

export function calculateTsumiScore(
  tasks: Task[],
  diagnosisResult: DiagnosisResult | null,
  baseDate?: Date,
): TsumiScoreResult {
  const referenceDate = baseDate ?? new Date();
  const incompleteTasks = tasks.filter((task) => !task.completed);

  if (incompleteTasks.length === 0) {
    return {
      score: 0,
      label: "余裕あり",
      message: "未完了タスクはありません。今はかなり余裕がある状態です。",
      reasons: ["未完了タスクがないため、つみ度は低い状態です。"],
      influentialTasks: [],
      breakdown: {
        overdueTaskCount: 0,
        upcomingDeadlineTaskCount: 0,
        mainReasons: ["未完了タスクがないため、つみ度は低い状態です。"],
      },
    };
  }

  const scoredTasks = incompleteTasks.map<TsumiInfluentialTask>((task) => {
    const autoPriority = judgeAutoPriority(
      task,
      diagnosisResult,
      referenceDate,
    );
    const daysUntilDeadline = getDaysUntilDeadline(
      task.deadline,
      referenceDate,
    );
    const taskScore =
      task.importance * 6 +
      autoPriorityWeight[autoPriority.level] +
      getDeadlineWeight(daysUntilDeadline) +
      getEstimatedMinutesWeight(task.estimatedMinutes);

    return {
      task,
      autoPriorityLevel: autoPriority.level,
      daysUntilDeadline,
      score: taskScore,
    };
  });
  const rawScore = scoredTasks.reduce(
    (total, scoredTask) => total + scoredTask.score,
    0,
  );
  const score = convertRawScoreToTsumiScore(rawScore, incompleteTasks.length);
  const influentialTasks = [...scoredTasks]
    .sort((firstTask, secondTask) => {
      if (secondTask.score !== firstTask.score) {
        return secondTask.score - firstTask.score;
      }

      return firstTask.daysUntilDeadline - secondTask.daysUntilDeadline;
    })
    .slice(0, 3);
  const reasons = buildReasons(scoredTasks);

  return {
    score,
    label: getLabel(score),
    message: getMessage(score),
    reasons,
    influentialTasks,
    breakdown: buildBreakdown(scoredTasks),
  };
}
