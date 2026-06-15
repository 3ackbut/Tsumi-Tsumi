import "../App.css";
import type { Task } from "../types/task";
import type { Schedule } from "../types/schedule";
import { Link } from "react-router-dom";

function Home() {
  const tsumido = 75;

  const tasks: Task[] = [
  {
    name: "英語課題",
    deadline: "2026-06-20",
    estimatedMinutes: 60,
    priority: 3,
    completed: false,
  },
  {
    name: "レポート",
    deadline: "2026-06-18",
    estimatedMinutes: 120,
    priority: 5,
    completed: false,
  },
  {
    name: "発表準備",
    deadline: "2026-06-25",
    estimatedMinutes: 90,
    priority: 4,
    completed: true,
  },
];

  const schedules: Schedule[] = [
    {
      title: "家庭教師",
      date: "2026-06-14",
      startTime: "19:00",
      endTime: "20:00",
    },
    {
      title: "ソフトウェア設計",
      date: "2026-06-14",
      startTime: "14:40",
      endTime: "16:10",
    },
  ];

  return (
    <main>
      <h1>Tsumi-Tsumi</h1>
      <p>タスクや予定を整理して、今日のつみ度を確認しよう。</p>

      <section>
        <h2>現在のつみ度</h2>
        <p>{tsumido}%</p>
      </section>

      <section>
        <h2>今日の状況</h2>
        <p>今日の予定：{schedules.length}件</p>
        <p>今日のタスク：{tasks.length}件</p>

        <h3>タスク一覧</h3>
        <ul>
          {tasks.map((task) => (
            <li key={task.name}>
              {task.name}（締切: {task.deadline} / 優先度: {task.priority}）
            </li>
          ))}
        </ul>

        <h3>予定一覧</h3>
        <ul>
          {schedules.map((schedule) => (
            <li key={schedule.title}>
              {schedule.title}（{schedule.startTime}〜{schedule.endTime}）
            </li>
          ))}
        </ul>
      </section>

      <section>
            <h2>メニュー</h2>

            <Link to="/tasks">
                <button>タスク確認</button>
            </Link>

            <Link to="/calendar">
                <button>カレンダー</button>
            </Link>

            <Link to="/status">
                <button>積み上げ状況</button>
            </Link>

            <Link to="/diagnosis">
                <button>診断</button>
            </Link>
        </section>
    </main>
  );
}

export default Home;