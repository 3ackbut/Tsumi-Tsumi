import {
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { sampleSchedules, sampleTasks } from "../data/sampleData";
import { AppDataContext } from "./DataContext";
import type { DiagnosisResult } from "../types/diagnosis";
import type { Schedule } from "../types/schedule";
import type { Task } from "../types/task";

const TASKS_STORAGE_KEY = "tsumi-tsumi-tasks";
const SCHEDULES_STORAGE_KEY = "tsumi-tsumi-schedules";
const DIAGNOSIS_STORAGE_KEY = "tsumi-tsumi-diagnosis-result";

function loadStoredData<T>(key: string, fallback: T[]): T[] {
  // localStorageは文字列として保存されるため、画面で使う配列に戻してからStateの初期値にする。
  const storedValue = localStorage.getItem(key);

  if (storedValue === null) {
    // 初回起動時は保存データがないので、提出デモで画面が空にならないようサンプルを使う。
    return fallback;
  }

  try {
    return JSON.parse(storedValue) as T[];
  } catch {
    // 保存データが壊れていても画面を開けるよう、サンプルデータに戻して復旧する。
    return fallback;
  }
}

type StoredTask = Task & {
  priority?: number;
};

// StoredTaskは古い保存形式も受け入れるための型。priorityは過去の「優先度」入力名。
function normalizeTask(task: StoredTask): Task {
  // 以前のpriority形式で保存されたタスクも、現在のimportance形式として読み込めるようにする。
  const importance = task.importance ?? task.priority ?? 3;

  return {
    name: task.name,
    deadline: task.deadline,
    estimatedMinutes: task.estimatedMinutes,
    importance,
    completed: task.completed,
  };
}

function loadStoredTasks() {
  // mapで1件ずつnormalizeTaskに通し、localStorage内の古いデータを現在のTask型にそろえる。
  return loadStoredData<StoredTask>(TASKS_STORAGE_KEY, sampleTasks).map(
    normalizeTask,
  );
}

function loadStoredResult<T>(key: string): T | null {
  // 診断結果は配列ではなく1件のオブジェクトなので、タスク・予定とは別の読み込み関数にする。
  const storedValue = localStorage.getItem(key);

  if (storedValue === null) {
    return null;
  }

  try {
    return JSON.parse(storedValue) as T;
  } catch {
    return null;
  }
}

interface AppDataProviderProps {
  children: ReactNode;
}

// Contextにまとめることで、Home/Tasks/Calendar/Statusが同じタスク・予定・診断結果を参照できる。
export function AppDataProvider({ children }: AppDataProviderProps) {
  // useStateの初期値に関数を渡すと、初回表示時だけlocalStorageの読み込みが実行される。
  const [tasks, setTasks] = useState<Task[]>(loadStoredTasks);
  const [schedules, setSchedules] = useState<Schedule[]>(() =>
    loadStoredData<Schedule>(SCHEDULES_STORAGE_KEY, sampleSchedules),
  );
  const [diagnosisResult, setDiagnosisResult] =
    useState<DiagnosisResult | null>(() =>
      loadStoredResult<DiagnosisResult>(DIAGNOSIS_STORAGE_KEY),
    );

  // useEffectはtasksが変わった後に動くため、追加・編集・削除のたびに保存内容を更新できる。
  useEffect(() => {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  // 予定もState変更後に保存し、HomeとCalendarで同じデータを表示できるようにする。
  useEffect(() => {
    localStorage.setItem(SCHEDULES_STORAGE_KEY, JSON.stringify(schedules));
  }, [schedules]);

  // 診断結果はnullの可能性があるため、未診断に戻したときは保存済みデータも削除する。
  useEffect(() => {
    if (diagnosisResult === null) {
      localStorage.removeItem(DIAGNOSIS_STORAGE_KEY);
      return;
    }

    localStorage.setItem(
      DIAGNOSIS_STORAGE_KEY,
      JSON.stringify(diagnosisResult),
    );
  }, [diagnosisResult]);

  const addTask = (task: Task) => {
    // 既存配列を直接変更せず、新しい配列を作るとReactが変更を検知しやすい。
    setTasks((currentTasks) => [...currentTasks, task]);
  };

  const updateTask = (index: number, task: Task) => {
    // mapで対象indexだけ差し替え、他のタスクはそのまま残す。
    setTasks((currentTasks) =>
      currentTasks.map((currentTask, currentIndex) =>
        currentIndex === index ? task : currentTask,
      ),
    );
  };

  const deleteTask = (index: number) => {
    // filterで削除対象以外を残す。配列を新しく作るため画面も更新される。
    setTasks((currentTasks) =>
      currentTasks.filter((_, currentIndex) => currentIndex !== index),
    );
  };

  const toggleTaskCompleted = (index: number) => {
    // 完了状態だけを反転し、タスク名や締切など他の情報はスプレッド構文で引き継ぐ。
    setTasks((currentTasks) =>
      currentTasks.map((task, currentIndex) =>
        currentIndex === index
          ? { ...task, completed: !task.completed }
          : task,
      ),
    );
  };

  const addSchedule = (schedule: Schedule) => {
    // 予定もタスクと同じ考え方で、新しい配列を作ってStateを更新する。
    setSchedules((currentSchedules) => [...currentSchedules, schedule]);
  };

  const updateSchedule = (index: number, schedule: Schedule) => {
    // 編集対象の予定だけを差し替えることで、他の日の予定を壊さない。
    setSchedules((currentSchedules) =>
      currentSchedules.map((currentSchedule, currentIndex) =>
        currentIndex === index ? schedule : currentSchedule,
      ),
    );
  };

  const deleteSchedule = (index: number) => {
    // 削除対象のindex以外を残し、Calendarの表示とlocalStorage保存につなげる。
    setSchedules((currentSchedules) =>
      currentSchedules.filter((_, currentIndex) => currentIndex !== index),
    );
  };

  const saveDiagnosisResult = (result: DiagnosisResult) => {
    setDiagnosisResult(result);
  };

  const resetDiagnosisResult = () => {
    setDiagnosisResult(null);
  };

  return (
    <AppDataContext.Provider
      value={{
        tasks,
        schedules,
        diagnosisResult,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskCompleted,
        addSchedule,
        updateSchedule,
        deleteSchedule,
        saveDiagnosisResult,
        resetDiagnosisResult,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
}
