/*
 * ファイル名: taskId.ts
 * 作成者: やわらか背骨チャンネル
 * 初版作成日: 2026年7月8日
 * 最終更新日: 2026年7月8日
 *
 * 概要:
 * タスクを一意に識別するidを生成する。
 * 新規タスク追加や旧localStorageデータの移行時に共通して利用する。
 *
 * 変更履歴:
 * 2026年7月8日   Issue #28 タスクid生成処理を追加
 */

export function createTaskId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `task-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
