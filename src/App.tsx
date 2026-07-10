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
 * 2026年7月3日  Issue #40 共通ナビゲーションと画面遷移時のスクロール復帰を追加
 */

import { BrowserRouter, NavLink, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Tasks from "./pages/Tasks";
import Calendar from "./pages/Calendar";
import Status from "./pages/Status";
import Diagnosis from "./pages/Diagnosis";
import ScrollToTop from "./components/ScrollToTop";
import { AppDataProvider } from "./context/AppDataContext";

const navigationItems = [
  { to: "/", label: "ホーム" },
  { to: "/tasks", label: "タスク管理" },
  { to: "/calendar", label: "カレンダー" },
  { to: "/status", label: "積み上げ状況" },
  { to: "/diagnosis", label: "診断" },
];

function AppNavigation() {
  return (
    <nav className="app-navigation" aria-label="画面移動">
      <div className="app-navigation-inner">
        {navigationItems.map((item) => (
          <NavLink
            className={({ isActive }) =>
              isActive ? "nav-link nav-link-active" : "nav-link"
            }
            end={item.to === "/"}
            key={item.to}
            to={item.to}
          >
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppDataProvider>
        <ScrollToTop />
        <AppNavigation />
        <div className="app-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/status" element={<Status />} />
            <Route path="/diagnosis" element={<Diagnosis />} />
          </Routes>
        </div>
      </AppDataProvider>
    </BrowserRouter>
  );
}

export default App;
