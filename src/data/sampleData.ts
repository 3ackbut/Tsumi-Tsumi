/*
 * ファイル名: sampleData.ts
 * 作成者: やわらか背骨チャンネル
 * 初版作成日: 2026年6月23日
 * 最終更新日: 2026年7月8日
 *
 * 概要:
 * 初回表示やlocalStorage復旧時に使うサンプルデータを定義する。
 * タスクと予定の例を用意し、提出デモで各画面の表示を確認しやすくする。
 *
 * 変更履歴:
 * 2026年6月23日  提出デモ用のサンプルタスク・予定を追加
 * 2026年6月23日  診断結果を用いた優先度判定に合わせてサンプルタスクを調整
 * 2026年6月26日  ソースコードヘッダを追加
 * 2026年7月8日   Issue #33 提出・発表用に初期サンプルデータを整理
 * 2026年7月8日   Issue #33 発表時期に合わせてサンプル日付を2026年8月へ変更
 * 2026年7月8日   Issue #28 サンプルタスクに一意のidを追加
 */

import type { Schedule } from "../types/schedule";
import type { Task } from "../types/task";

export const sampleTasks: Task[] = [
  {
    id: "sample-task-report-20260801",
    name: "情報システム論レポート提出",
    deadline: "2026-08-01",
    estimatedMinutes: 150,
    importance: 5,
    completed: false,
  },
  {
    id: "sample-task-presentation-20260803",
    name: "ゼミ発表スライドの最終確認",
    deadline: "2026-08-03",
    estimatedMinutes: 60,
    importance: 4,
    completed: false,
  },
  {
    id: "sample-task-programming-20260805",
    name: "プログラミング課題のデバッグ",
    deadline: "2026-08-05",
    estimatedMinutes: 120,
    importance: 4,
    completed: false,
  },
  {
    id: "sample-task-statistics-review-20260808",
    name: "統計学の復習ノート整理",
    deadline: "2026-08-08",
    estimatedMinutes: 45,
    importance: 3,
    completed: false,
  },
  {
    id: "sample-task-references-20260815",
    name: "参考文献リスト作成",
    deadline: "2026-08-15",
    estimatedMinutes: 30,
    importance: 2,
    completed: false,
  },
  {
    id: "sample-task-english-review-20260812",
    name: "英語小テストの復習",
    deadline: "2026-08-12",
    estimatedMinutes: 30,
    importance: 2,
    completed: true,
  },
];

export const sampleSchedules: Schedule[] = [
  {
    title: "ゼミミーティング",
    date: "2026-08-01",
    startTime: "10:30",
    endTime: "11:30",
  },
  {
    title: "家庭教師",
    date: "2026-08-02",
    startTime: "19:00",
    endTime: "20:00",
  },
  {
    title: "グループ発表練習",
    date: "2026-08-04",
    startTime: "13:00",
    endTime: "14:30",
  },
  {
    title: "授業資料の確認",
    date: "2026-08-06",
    startTime: "16:20",
    endTime: "17:00",
  },
];
