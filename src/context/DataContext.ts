import { createContext } from "react";
import type { DiagnosisResult } from "../types/diagnosis";
import type { Schedule } from "../types/schedule";
import type { Task } from "../types/task";

export interface AppDataContextValue {
  tasks: Task[];
  schedules: Schedule[];
  diagnosisResult: DiagnosisResult | null;
  addTask: (task: Task) => void;
  updateTask: (index: number, task: Task) => void;
  deleteTask: (index: number) => void;
  toggleTaskCompleted: (index: number) => void;
  addSchedule: (schedule: Schedule) => void;
  updateSchedule: (index: number, schedule: Schedule) => void;
  deleteSchedule: (index: number) => void;
  saveDiagnosisResult: (result: DiagnosisResult) => void;
  resetDiagnosisResult: () => void;
}

export const AppDataContext = createContext<AppDataContextValue | undefined>(
  undefined,
);
