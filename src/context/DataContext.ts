/*
 * ファイル名: DataContext.ts
 * 作成者: やわらか背骨チャンネル
 * 初版作成日: 2026年6月23日
 * 最終更新日: 2026年6月26日
 *
 * 概要:
 * アプリ全体で共有するデータと操作関数の型を定義する。
 * React Contextを作成し、各画面から共通データへアクセスできるようにする。
 *
 * 変更履歴:
 * 2026年6月23日  タスクと予定を共有するContext型を作成
 * 2026年6月23日  診断結果の共有項目を追加
 * 2026年6月26日  ソースコードヘッダを追加
 */

import { createContext } from "react";
import type { DiagnosisResult } from "../types/diagnosis";
import type { Schedule } from "../types/schedule";
import type { Task } from "../types/task";

export interface AppDataContextValue {
  tasks: Task[];
  schedules: Schedule[];
  diagnosisResult: DiagnosisResult | null;
  addTask: (task: Task) => void;
  updateTask: (index: number, task: Task) => void;
  deleteTask: (index: number) => void;
  toggleTaskCompleted: (index: number) => void;
  addSchedule: (schedule: Schedule) => void;
  updateSchedule: (index: number, schedule: Schedule) => void;
  deleteSchedule: (index: number) => void;
  saveDiagnosisResult: (result: DiagnosisResult) => void;
  resetDiagnosisResult: () => void;
}

export const AppDataContext = createContext<AppDataContextValue | undefined>(
  undefined,
);
