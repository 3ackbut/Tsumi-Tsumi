/*
 * ファイル名: App.tsx
 * 作成者: やわらか背骨チャンネル
 * 初版作成日: 2026年6月12日
 * 最終更新日: 2026年6月26日
 *
 * 概要:
 * React Routerを使って各画面へのルーティングを定義する。
 * AppDataProviderでアプリ全体を包み、タスク・予定・診断結果を共有できるようにする。
 *
 * 変更履歴:
 * 2026年6月12日  React・TypeScript環境の起点として作成
 * 2026年6月15日  React Routerによる画面遷移を追加
 * 2026年6月23日  AppDataProviderによる共有データ管理を追加
 * 2026年6月26日  ソースコードヘッダを追加
 */

import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Tasks from "./pages/Tasks";
import Calendar from "./pages/Calendar";
import Status from "./pages/Status";
import Diagnosis from "./pages/Diagnosis";
import { AppDataProvider } from "./context/AppDataContext";

function App() {
  return (
    <BrowserRouter>
      <AppDataProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/status" element={<Status />} />
          <Route path="/diagnosis" element={<Diagnosis />} />
        </Routes>
      </AppDataProvider>
    </BrowserRouter>
  );
}

export default App;
