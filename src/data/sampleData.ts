import type { Schedule } from "../types/schedule";
import type { Task } from "../types/task";

export const sampleTasks: Task[] = [
  {
    name: "英語課題",
    deadline: "2026-06-23",
    estimatedMinutes: 60,
    priority: 3,
    completed: false,
  },
  {
    name: "レポート提出",
    deadline: "2026-06-23",
    estimatedMinutes: 120,
    priority: 5,
    completed: false,
  },
  {
    name: "発表準備",
    deadline: "2026-06-24",
    estimatedMinutes: 90,
    priority: 4,
    completed: true,
  },
  {
    name: "設計書の見直し",
    deadline: "2026-06-25",
    estimatedMinutes: 45,
    priority: 2,
    completed: false,
  },
];

export const sampleSchedules: Schedule[] = [
  {
    title: "ソフトウェア設計",
    date: "2026-06-23",
    startTime: "14:40",
    endTime: "16:10",
  },
  {
    title: "家庭教師",
    date: "2026-06-23",
    startTime: "19:00",
    endTime: "20:00",
  },
  {
    title: "グループ作業",
    date: "2026-06-24",
    startTime: "13:00",
    endTime: "15:00",
  },
  {
    title: "資料確認",
    date: "2026-06-25",
    startTime: "10:30",
    endTime: "11:30",
  },
];
