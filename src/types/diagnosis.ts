/*
 * ファイル名: diagnosis.ts
 * 作成者: やわらか背骨チャンネル
 * 初版作成日: 2026年6月23日
 * 最終更新日: 2026年6月26日
 *
 * 概要:
 * 性格診断結果を表すTypeScriptの型を定義する。
 * 診断タイプ、説明、特徴、おすすめの進め方、診断日時を共通形式で扱う。
 *
 * 変更履歴:
 * 2026年6月23日  性格診断結果の型定義を作成
 * 2026年6月26日  ソースコードヘッダを追加
 */

export interface DiagnosisResult {
  typeName: string;
  description: string;
  feature: string;
  recommendation: string;
  diagnosedAt: string;
}
