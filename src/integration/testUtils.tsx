import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { expect } from 'vitest';
import App from '../App';
import type { DiagnosisResult } from '../types/diagnosis';
import type { Schedule } from '../types/schedule';
import type { Task } from '../types/task';

export const TASKS_STORAGE_KEY = 'tsumi-tsumi-tasks';
export const SCHEDULES_STORAGE_KEY = 'tsumi-tsumi-schedules';
export const DIAGNOSIS_STORAGE_KEY = 'tsumi-tsumi-diagnosis-result';

export function formatDate(date: Date) {
  return date.toLocaleDateString('sv-SE');
}

export function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

export function todayString() {
  return formatDate(new Date());
}

export function task(overrides: Partial<Task> = {}): Task {
  return {
    id: 'it-task-1',
    name: 'IT結合タスク',
    deadline: todayString(),
    estimatedMinutes: 30,
    importance: 3,
    completed: false,
    ...overrides,
  };
}

export function schedule(overrides: Partial<Schedule> = {}): Schedule {
  return {
    title: 'IT結合予定',
    date: todayString(),
    startTime: '10:00',
    endTime: '11:00',
    ...overrides,
  };
}

export function diagnosisResult(
  overrides: Partial<DiagnosisResult> = {},
): DiagnosisResult {
  return {
    typeName: '計画型',
    description: 'IT診断説明',
    feature: 'IT診断特徴',
    recommendation: 'IT診断おすすめ',
    diagnosedAt: '2026-07-17T00:00:00.000Z',
    ...overrides,
  };
}

export function renderApp(path = '/') {
  window.history.pushState({}, '', path);
  return render(<App />);
}

export function navigateTo(label: string) {
  fireEvent.click(screen.getByRole('link', { name: label }));
}

export function storedTasks() {
  return JSON.parse(localStorage.getItem(TASKS_STORAGE_KEY) ?? '[]') as Task[];
}

export function storedSchedules() {
  return JSON.parse(
    localStorage.getItem(SCHEDULES_STORAGE_KEY) ?? '[]',
  ) as Schedule[];
}

export function storedDiagnosis() {
  const value = localStorage.getItem(DIAGNOSIS_STORAGE_KEY);
  return value === null ? null : (JSON.parse(value) as DiagnosisResult);
}

export async function waitForStoredTasks(
  predicate: (tasks: Task[]) => boolean,
) {
  await waitFor(() => {
    expect(predicate(storedTasks())).toBe(true);
  });
}

export async function waitForStoredSchedules(
  predicate: (schedules: Schedule[]) => boolean,
) {
  await waitFor(() => {
    expect(predicate(storedSchedules())).toBe(true);
  });
}

export function fillTaskForm(values: {
  name?: string;
  deadline?: string;
  estimatedMinutes?: string;
  importance?: string;
}) {
  if (values.name !== undefined) {
    fireEvent.input(screen.getByLabelText('タスク名'), {
      target: { value: values.name },
    });
  }

  if (values.deadline !== undefined) {
    fireEvent.input(screen.getByLabelText('締切'), {
      target: { value: values.deadline },
    });
  }

  if (values.estimatedMinutes !== undefined) {
    fireEvent.input(screen.getByLabelText('見積時間（分）'), {
      target: { value: values.estimatedMinutes },
    });
  }

  if (values.importance !== undefined) {
    fireEvent.input(screen.getByLabelText('重要度（1-5）'), {
      target: { value: values.importance },
    });
  }
}

export function saveTaskForm() {
  fireEvent.click(
    screen.getByRole('button', { name: /タスク追加|変更を保存/ }),
  );
}

export function fillScheduleForm(values: {
  title?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
}) {
  if (values.title !== undefined) {
    fireEvent.input(screen.getByLabelText('予定名'), {
      target: { value: values.title },
    });
  }

  if (values.date !== undefined) {
    fireEvent.input(screen.getByLabelText('日付'), {
      target: { value: values.date },
    });
  }

  if (values.startTime !== undefined) {
    fireEvent.input(screen.getByLabelText('開始時刻'), {
      target: { value: values.startTime },
    });
  }

  if (values.endTime !== undefined) {
    fireEvent.input(screen.getByLabelText('終了時刻'), {
      target: { value: values.endTime },
    });
  }
}

export function saveScheduleForm() {
  fireEvent.click(
    screen.getByRole('button', { name: /予定追加|変更を保存/ }),
  );
}

export function listItemByText(text: string) {
  const element = screen.getAllByText(text)[0];
  const item = element.closest('li');

  if (item === null) {
    throw new Error(`List item was not found for ${text}`);
  }

  return item;
}

export function clickActionInItem(itemText: string, actionName: string) {
  fireEvent.click(
    within(listItemByText(itemText)).getByRole('button', { name: actionName }),
  );
}
