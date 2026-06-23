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
  const storedValue = localStorage.getItem(key);

  if (storedValue === null) {
    return fallback;
  }

  try {
    return JSON.parse(storedValue) as T[];
  } catch {
    return fallback;
  }
}

type StoredTask = Task & {
  priority?: number;
};

function normalizeTask(task: StoredTask): Task {
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
  return loadStoredData<StoredTask>(TASKS_STORAGE_KEY, sampleTasks).map(
    normalizeTask,
  );
}

function loadStoredResult<T>(key: string): T | null {
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

export function AppDataProvider({ children }: AppDataProviderProps) {
  const [tasks, setTasks] = useState<Task[]>(loadStoredTasks);
  const [schedules, setSchedules] = useState<Schedule[]>(() =>
    loadStoredData<Schedule>(SCHEDULES_STORAGE_KEY, sampleSchedules),
  );
  const [diagnosisResult, setDiagnosisResult] =
    useState<DiagnosisResult | null>(() =>
      loadStoredResult<DiagnosisResult>(DIAGNOSIS_STORAGE_KEY),
    );

  useEffect(() => {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(SCHEDULES_STORAGE_KEY, JSON.stringify(schedules));
  }, [schedules]);

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
    setTasks((currentTasks) => [...currentTasks, task]);
  };

  const updateTask = (index: number, task: Task) => {
    setTasks((currentTasks) =>
      currentTasks.map((currentTask, currentIndex) =>
        currentIndex === index ? task : currentTask,
      ),
    );
  };

  const deleteTask = (index: number) => {
    setTasks((currentTasks) =>
      currentTasks.filter((_, currentIndex) => currentIndex !== index),
    );
  };

  const toggleTaskCompleted = (index: number) => {
    setTasks((currentTasks) =>
      currentTasks.map((task, currentIndex) =>
        currentIndex === index
          ? { ...task, completed: !task.completed }
          : task,
      ),
    );
  };

  const addSchedule = (schedule: Schedule) => {
    setSchedules((currentSchedules) => [...currentSchedules, schedule]);
  };

  const updateSchedule = (index: number, schedule: Schedule) => {
    setSchedules((currentSchedules) =>
      currentSchedules.map((currentSchedule, currentIndex) =>
        currentIndex === index ? schedule : currentSchedule,
      ),
    );
  };

  const deleteSchedule = (index: number) => {
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
