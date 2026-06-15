import "./App.css";
import type { Task } from "./types/task";
import type { Schedule } from "./types/schedule";

function App() {
  const tsumido = 75;
  
  const tasks: Task[] = [
  {
    name: "英語課題",
    deadline: "2026-06-20",
    priority: 3,
  },
  {
    name: "レポート",
    deadline: "2026-06-18",
    priority: 5,
  },
  {
    name: "発表準備",
    deadline: "2026-06-25",
    priority: 4,
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
            <li>
               {task.name}（締切: {task.deadline} / 優先度: {task.priority}）
            </li>
          ))}
  </ul>

  <h3>予定一覧</h3>

<ul>
  {schedules.map((schedule) => (
    <li>
      {schedule.title}（{schedule.startTime}〜{schedule.endTime}）
    </li>
  ))}
</ul>

      </section>

      <section>
        <h2>メニュー</h2>
        <button>タスク確認</button>
        <button>カレンダー</button>
        <button>積み上げ状況</button>
        <button>診断</button>
      </section>
    </main>
  );
}

export default App;