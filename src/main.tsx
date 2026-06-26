/*
 * ファイル名: main.tsx
 * 作成者: やわらか背骨チャンネル
 * 初版作成日: 2026年6月12日
 * 最終更新日: 2026年6月26日
 *
 * 概要:
 * Reactアプリケーションの起点となるファイル。
 * HTMLのroot要素にAppコンポーネントを描画し、画面全体を開始する。
 *
 * 変更履歴:
 * 2026年6月12日  React・TypeScript環境のエントリーポイントとして作成
 * 2026年6月26日  ソースコードヘッダを追加
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
