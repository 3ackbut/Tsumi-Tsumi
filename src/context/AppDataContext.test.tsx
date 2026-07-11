import { act, render, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { DiagnosisResult } from '../types/diagnosis';
import type { Schedule } from '../types/schedule';
import type { Task } from '../types/task';
import { sampleSchedules, sampleTasks } from '../data/sampleData';
import { useAppData } from '../hooks/useAppData';
import type { AppDataContextValue } from './DataContext';
import { AppDataProvider } from './AppDataContext';
import { createTaskId } from '../utils/taskId';

vi.mock('../utils/taskId', () => ({
  createTaskId: vi.fn(),
}));

const TASKS_STORAGE_KEY = 'tsumi-tsumi-tasks';
const SCHEDULES_STORAGE_KEY = 'tsumi-tsumi-schedules';
const DIAGNOSIS_STORAGE_KEY = 'tsumi-tsumi-diagnosis-result';

const mockedCreateTaskId = vi.mocked(createTaskId);

const task = (overrides: Partial<Task> = {}): Task => ({
  id: 'task-1',
  name: 'テストタスク',
  deadline: '2026-08-20',
  estimatedMinutes: 30,
  importance: 3,
  completed: false,
  ...overrides,
});

const schedule = (overrides: Partial<Schedule> = {}): Schedule => ({
  title: 'テスト予定',
  date: '2026-08-20',
  startTime: '10:00',
  endTime: '11:00',
  ...overrides,
});

const diagnosisResult = (
  overrides: Partial<DiagnosisResult> = {},
): DiagnosisResult => ({
  typeName: '計画型',
  description: '説明',
  feature: '特徴',
  recommendation: 'おすすめ',
  diagnosedAt: '2026-07-11T00:00:00.000Z',
  ...overrides,
});

function renderProvider() {
  let currentContext: AppDataContextValue | undefined;

  function Consumer() {
    currentContext = useAppData();
    return null;
  }

  render(
    <AppDataProvider>
      <Consumer />
    </AppDataProvider>,
  );

  return {
    get context() {
      if (currentContext === undefined) {
        throw new Error('Context was not captured');
      }

      return currentContext;
    },
  };
}

function storedTasks() {
  return JSON.parse(localStorage.getItem(TASKS_STORAGE_KEY) ?? '[]') as Task[];
}

function storedSchedules() {
  return JSON.parse(
    localStorage.getItem(SCHEDULES_STORAGE_KEY) ?? '[]',
  ) as Schedule[];
}

beforeEach(() => {
  mockedCreateTaskId.mockReset();
  mockedCreateTaskId.mockReturnValue('generated-task-id');
});

describe('AppDataProvider', () => {
  it('localStorageが空の場合はサンプルデータと診断結果nullで初期化する', async () => {
    const view = renderProvider();

    expect(view.context.tasks).toEqual(sampleTasks);
    expect(view.context.schedules).toEqual(sampleSchedules);
    expect(view.context.diagnosisResult).toBeNull();

    await waitFor(() => {
      expect(storedTasks()).toEqual(sampleTasks);
      expect(storedSchedules()).toEqual(sampleSchedules);
      expect(localStorage.getItem(DIAGNOSIS_STORAGE_KEY)).toBeNull();
    });
  });

  it('localStorageに正常なJSONがある場合は保存済みデータを読み込む', async () => {
    const storedTask = task({ id: 'stored-task', name: '保存済みタスク' });
    const storedSchedule = schedule({ title: '保存済み予定' });
    const storedDiagnosis = diagnosisResult({ typeName: '締切集中型' });
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify([storedTask]));
    localStorage.setItem(SCHEDULES_STORAGE_KEY, JSON.stringify([storedSchedule]));
    localStorage.setItem(
      DIAGNOSIS_STORAGE_KEY,
      JSON.stringify(storedDiagnosis),
    );

    const view = renderProvider();

    expect(view.context.tasks).toEqual([storedTask]);
    expect(view.context.schedules).toEqual([storedSchedule]);
    expect(view.context.diagnosisResult).toEqual(storedDiagnosis);

    await waitFor(() => {
      expect(storedTasks()).toEqual([storedTask]);
      expect(storedSchedules()).toEqual([storedSchedule]);
      expect(JSON.parse(localStorage.getItem(DIAGNOSIS_STORAGE_KEY) ?? '{}')).toEqual(
        storedDiagnosis,
      );
    });
  });

  it('localStorageに壊れたJSONがある場合はfallbackまたはnullに復旧する', async () => {
    localStorage.setItem(TASKS_STORAGE_KEY, '{broken');
    localStorage.setItem(SCHEDULES_STORAGE_KEY, '{broken');
    localStorage.setItem(DIAGNOSIS_STORAGE_KEY, '{broken');

    const view = renderProvider();

    expect(view.context.tasks).toEqual(sampleTasks);
    expect(view.context.schedules).toEqual(sampleSchedules);
    expect(view.context.diagnosisResult).toBeNull();

    await waitFor(() => {
      expect(storedTasks()).toEqual(sampleTasks);
      expect(storedSchedules()).toEqual(sampleSchedules);
      expect(localStorage.getItem(DIAGNOSIS_STORAGE_KEY)).toBeNull();
    });
  });

  it('旧形式タスクのidとimportanceを補完する', async () => {
    mockedCreateTaskId
      .mockReturnValueOnce('generated-task-id-1')
      .mockReturnValueOnce('generated-task-id-2');
    localStorage.setItem(
      TASKS_STORAGE_KEY,
      JSON.stringify([
        {
          name: 'priority形式',
          deadline: '2026-08-21',
          estimatedMinutes: 45,
          priority: 4,
          completed: false,
        },
        {
          id: '',
          name: 'id空文字',
          deadline: '2026-08-22',
          estimatedMinutes: 60,
          completed: true,
        },
        {
          id: 'current-id',
          name: '現行形式',
          deadline: '2026-08-23',
          estimatedMinutes: 90,
          importance: 5,
          completed: false,
        },
      ]),
    );

    const view = renderProvider();

    expect(view.context.tasks).toEqual([
      {
        id: 'generated-task-id-1',
        name: 'priority形式',
        deadline: '2026-08-21',
        estimatedMinutes: 45,
        importance: 4,
        completed: false,
      },
      {
        id: 'generated-task-id-2',
        name: 'id空文字',
        deadline: '2026-08-22',
        estimatedMinutes: 60,
        importance: 3,
        completed: true,
      },
      {
        id: 'current-id',
        name: '現行形式',
        deadline: '2026-08-23',
        estimatedMinutes: 90,
        importance: 5,
        completed: false,
      },
    ]);
    expect(mockedCreateTaskId).toHaveBeenCalledTimes(2);

    await waitFor(() => {
      expect(storedTasks()).toEqual(view.context.tasks);
    });
  });

  it('タスクの追加、更新、削除、完了切替を行う', async () => {
    const firstTask = task({ id: 'task-1', name: '最初のタスク' });
    const secondTask = task({ id: 'task-2', name: '追加タスク' });
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify([firstTask]));

    const view = renderProvider();

    act(() => view.context.addTask(secondTask));

    await waitFor(() => {
      expect(view.context.tasks).toEqual([firstTask, secondTask]);
      expect(storedTasks()).toEqual([firstTask, secondTask]);
    });

    const updatedSecondTask = {
      ...secondTask,
      name: '更新後タスク',
      estimatedMinutes: 90,
    };
    act(() => view.context.updateTask('task-2', updatedSecondTask));

    await waitFor(() => {
      expect(view.context.tasks).toEqual([firstTask, updatedSecondTask]);
      expect(storedTasks()).toEqual([firstTask, updatedSecondTask]);
    });

    act(() => view.context.updateTask('missing-id', task({ id: 'missing-id' })));

    await waitFor(() => {
      expect(view.context.tasks).toEqual([firstTask, updatedSecondTask]);
    });

    act(() => view.context.toggleTaskCompleted('task-2'));

    await waitFor(() => {
      expect(view.context.tasks[1]).toEqual({
        ...updatedSecondTask,
        completed: true,
      });
    });

    act(() => view.context.deleteTask('task-1'));

    await waitFor(() => {
      expect(view.context.tasks).toEqual([
        {
          ...updatedSecondTask,
          completed: true,
        },
      ]);
      expect(storedTasks()).toEqual(view.context.tasks);
    });

    act(() => view.context.deleteTask('missing-id'));

    await waitFor(() => {
      expect(view.context.tasks).toEqual([
        {
          ...updatedSecondTask,
          completed: true,
        },
      ]);
    });
  });

  it('予定の追加、更新、削除を行う', async () => {
    const firstSchedule = schedule({ title: '最初の予定' });
    const secondSchedule = schedule({ title: '追加予定', startTime: '12:00' });
    localStorage.setItem(
      SCHEDULES_STORAGE_KEY,
      JSON.stringify([firstSchedule]),
    );

    const view = renderProvider();

    act(() => view.context.addSchedule(secondSchedule));

    await waitFor(() => {
      expect(view.context.schedules).toEqual([firstSchedule, secondSchedule]);
      expect(storedSchedules()).toEqual([firstSchedule, secondSchedule]);
    });

    const updatedSchedule = {
      ...secondSchedule,
      title: '更新後予定',
      endTime: '13:30',
    };
    act(() => view.context.updateSchedule(1, updatedSchedule));

    await waitFor(() => {
      expect(view.context.schedules).toEqual([firstSchedule, updatedSchedule]);
      expect(storedSchedules()).toEqual([firstSchedule, updatedSchedule]);
    });

    act(() => view.context.updateSchedule(99, schedule({ title: '範囲外' })));

    await waitFor(() => {
      expect(view.context.schedules).toEqual([firstSchedule, updatedSchedule]);
    });

    act(() => view.context.deleteSchedule(0));

    await waitFor(() => {
      expect(view.context.schedules).toEqual([updatedSchedule]);
      expect(storedSchedules()).toEqual([updatedSchedule]);
    });

    act(() => view.context.deleteSchedule(99));

    await waitFor(() => {
      expect(view.context.schedules).toEqual([updatedSchedule]);
    });
  });

  it('診断結果の保存と削除を行う', async () => {
    const view = renderProvider();
    const result = diagnosisResult({ typeName: '気分変動型' });

    act(() => view.context.saveDiagnosisResult(result));

    await waitFor(() => {
      expect(view.context.diagnosisResult).toEqual(result);
      expect(JSON.parse(localStorage.getItem(DIAGNOSIS_STORAGE_KEY) ?? '{}')).toEqual(
        result,
      );
    });

    act(() => view.context.resetDiagnosisResult());

    await waitFor(() => {
      expect(view.context.diagnosisResult).toBeNull();
      expect(localStorage.getItem(DIAGNOSIS_STORAGE_KEY)).toBeNull();
    });
  });

  it('全データリセットで保存データとStateを初期状態へ戻す', async () => {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify([task()]));
    localStorage.setItem(SCHEDULES_STORAGE_KEY, JSON.stringify([schedule()]));
    localStorage.setItem(
      DIAGNOSIS_STORAGE_KEY,
      JSON.stringify(diagnosisResult()),
    );
    const view = renderProvider();

    act(() => view.context.resetAppData());

    await waitFor(() => {
      expect(view.context.tasks).toEqual(sampleTasks);
      expect(view.context.schedules).toEqual(sampleSchedules);
      expect(view.context.diagnosisResult).toBeNull();
      expect(storedTasks()).toEqual(sampleTasks);
      expect(storedSchedules()).toEqual(sampleSchedules);
      expect(localStorage.getItem(DIAGNOSIS_STORAGE_KEY)).toBeNull();
    });
  });
});

describe('useAppData', () => {
  it('Provider外で使った場合はエラーをthrowする', () => {
    function ConsumerOutsideProvider() {
      useAppData();
      return null;
    }

    expect(() => render(<ConsumerOutsideProvider />)).toThrow(
      'useAppData must be used within AppDataProvider',
    );
  });
});
