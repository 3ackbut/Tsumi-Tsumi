/*
 * ファイル名: sampleData.ts
 * 作成者: やわらか背骨チャンネル
 * 初版作成日: 2026年6月23日
 * 最終更新日: 2026年6月26日
 *
 * 概要:
 * 初回表示やlocalStorage復旧時に使うサンプルデータを定義する。
 * タスクと予定の例を用意し、提出デモで各画面の表示を確認しやすくする。
 *
 * 変更履歴:
 * 2026年6月23日  提出デモ用のサンプルタスク・予定を追加
 * 2026年6月23日  診断結果を用いた優先度判定に合わせてサンプルタスクを調整
 * 2026年6月26日  ソースコードヘッダを追加
 */

import type { Schedule } from "../types/schedule";
import type { Task } from "../types/task";

export const sampleTasks: Task[] = [
  {
    name: "英語課題",
    deadline: "2026-06-23",
    estimatedMinutes: 60,
    importance: 3,
    completed: false,
  },
  {
    name: "レポート提出",
    deadline: "2026-06-23",
    estimatedMinutes: 120,
    importance: 5,
    completed: false,
  },
  {
    name: "発表準備",
    deadline: "2026-06-24",
    estimatedMinutes: 90,
    importance: 4,
    completed: true,
  },
  {
    name: "設計書の見直し",
    deadline: "2026-06-25",
    estimatedMinutes: 45,
    importance: 2,
    completed: false,
  },
];

export const sampleSchedules: Schedule[] = [
  {
    title: "ソフトウェア設計",
    date: "2026-06-23",
    startTime: "14:40",
    endTime: "16:10",
  },
  {
    title: "家庭教師",
    date: "2026-06-23",
    startTime: "19:00",
    endTime: "20:00",
  },
  {
    title: "グループ作業",
    date: "2026-06-24",
    startTime: "13:00",
    endTime: "15:00",
  },
  {
    title: "資料確認",
    date: "2026-06-25",
    startTime: "10:30",
    endTime: "11:30",
  },
];
