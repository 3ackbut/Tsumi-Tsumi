/*
 * ファイル名: useAppData.ts
 * 作成者: やわらか背骨チャンネル
 * 初版作成日: 2026年6月23日
 * 最終更新日: 2026年6月26日
 *
 * 概要:
 * AppDataContextを各画面から簡単に利用するためのカスタムフック。
 * Providerの外で使われた場合にエラーを出し、実装ミスに気づきやすくする。
 *
 * 変更履歴:
 * 2026年6月23日  AppDataContextを利用するカスタムフックを作成
 * 2026年6月26日  ソースコードヘッダを追加
 */

import { useContext } from "react";
import { AppDataContext } from "../context/DataContext";

export function useAppData() {
  const context = useContext(AppDataContext);

  if (context === undefined) {
    throw new Error("useAppData must be used within AppDataProvider");
  }

  return context;
}
