/*
 * ファイル名: ScrollToTop.tsx
 * 作成者: やわらか背骨チャンネル
 * 初版作成日: 2026年7月3日
 * 最終更新日: 2026年7月3日
 *
 * 概要:
 * React Routerの画面遷移時にページ上部へスクロールする補助コンポーネント。
 *
 * 変更履歴:
 * 2026年7月3日  Issue #40 画面遷移時にページ上部へ戻す処理を追加
 */

import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default ScrollToTop;
