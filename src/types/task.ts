/*
 * ファイル名: task.ts
 * 作成者: やわらか背骨チャンネル
 * 初版作成日: 2026年6月15日
 * 最終更新日: 2026年7月8日
 *
 * 概要:
 * タスク情報を表すTypeScriptの型を定義する。
 * タスク名、締切、見積時間、重要度、完了状態を画面間で共通して扱う。
 *
 * 変更履歴:
 * 2026年6月15日  タスク情報の型定義を作成
 * 2026年6月23日  priorityをimportanceへ変更し自動優先度判定に対応
 * 2026年6月26日  ソースコードヘッダを追加
 * 2026年7月8日   Issue #28 タスクをidで識別できるようid項目を追加
 */

export interface Task {
  id: string;
  name: string;
  deadline: string;
  estimatedMinutes: number;
  importance: number;
  completed: boolean;
}
