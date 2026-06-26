/*
 * ファイル名: schedule.ts
 * 作成者: やわらか背骨チャンネル
 * 初版作成日: 2026年6月15日
 * 最終更新日: 2026年6月26日
 *
 * 概要:
 * 予定情報を表すTypeScriptの型を定義する。
 * 予定名、日付、開始時刻、終了時刻をCalendarやHomeで共通して扱う。
 *
 * 変更履歴:
 * 2026年6月15日  予定情報の型定義を作成
 * 2026年6月26日  ソースコードヘッダを追加
 */

export interface Schedule {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
}
