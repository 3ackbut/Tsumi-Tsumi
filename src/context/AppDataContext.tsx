import {
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { sampleSchedules, sampleTasks } from "../data/sampleData";
import { AppDataContext } from "./DataContext";
import type { Schedule } from "../types/schedule";
import type { Task } from "../types/task";

const TASKS_STORAGE_KEY = "tsumi-tsumi-tasks";
const SCHEDULES_STORAGE_KEY = "tsumi-tsumi-schedules";

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

interface AppDataProviderProps {
  children: ReactNode;
}

export function AppDataProvider({ children }: AppDataProviderProps) {
  const [tasks, setTasks] = useState<Task[]>(() =>
    loadStoredData<Task>(TASKS_STORAGE_KEY, sampleTasks),
  );
  const [schedules, setSchedules] = useState<Schedule[]>(() =>
    loadStoredData<Schedule>(SCHEDULES_STORAGE_KEY, sampleSchedules),
  );

  useEffect(() => {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(SCHEDULES_STORAGE_KEY, JSON.stringify(schedules));
  }, [schedules]);

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

  return (
    <AppDataContext.Provider
      value={{
        tasks,
        schedules,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskCompleted,
        addSchedule,
        updateSchedule,
        deleteSchedule,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
}
