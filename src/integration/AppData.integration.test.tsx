import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { sampleSchedules, sampleTasks } from '../data/sampleData';
import {
  DIAGNOSIS_STORAGE_KEY,
  SCHEDULES_STORAGE_KEY,
  TASKS_STORAGE_KEY,
  clickActionInItem,
  diagnosisResult,
  fillTaskForm,
  navigateTo,
  renderApp,
  schedule,
  saveTaskForm,
  storedDiagnosis,
  storedSchedules,
  storedTasks,
  task,
  todayString,
  waitForStoredTasks,
} from './testUtils';

describe('IT-A01 初期データ読み込み', () => {
  it('IT-A01 localStorageが空の場合はサンプルデータと未診断状態を画面へ反映する', async () => {
    renderApp();

    expect(
      screen.getByRole('heading', { level: 1, name: 'Tsumi-Tsumi' }),
    ).toBeInTheDocument();
    expect(screen.getByText('未診断: タイプを確認')).toBeInTheDocument();

    navigateTo('タスク管理');
    expect(screen.getByText(sampleTasks[0].name)).toBeInTheDocument();

    navigateTo('カレンダー');
    expect(
      screen.getByRole('heading', { level: 2, name: '週間カレンダー' }),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(storedTasks()).toEqual(sampleTasks);
      expect(storedSchedules()).toEqual(sampleSchedules);
      expect(localStorage.getItem(DIAGNOSIS_STORAGE_KEY)).toBeNull();
    });
  });
});

describe('IT-A02 保存済みデータ読み込み', () => {
  it('IT-A02 保存済みタスク・予定・診断結果を各画面へ反映する', async () => {
    const storedTask = task({
      id: 'it-a02-task',
      name: 'IT-A02保存済みタスク',
      deadline: todayString(),
      estimatedMinutes: 45,
      importance: 4,
    });
    const storedSchedule = schedule({
      title: 'IT-A02保存済み予定',
      date: todayString(),
      startTime: '09:00',
      endTime: '10:00',
    });
    const storedResult = diagnosisResult({
      typeName: '締切集中型',
      description: 'IT-A02説明',
      feature: 'IT-A02特徴',
      recommendation: 'IT-A02おすすめ',
    });
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify([storedTask]));
    localStorage.setItem(SCHEDULES_STORAGE_KEY, JSON.stringify([storedSchedule]));
    localStorage.setItem(DIAGNOSIS_STORAGE_KEY, JSON.stringify(storedResult));

    renderApp();

    expect(screen.getByText('IT-A02保存済みタスク')).toBeInTheDocument();
    expect(screen.getByText('IT-A02保存済み予定')).toBeInTheDocument();
    expect(screen.getByText('締切集中型: 結果を見る')).toBeInTheDocument();

    navigateTo('タスク管理');
    expect(screen.getByText('IT-A02保存済みタスク')).toBeInTheDocument();

    navigateTo('カレンダー');
    expect(screen.getByText('IT-A02保存済み予定')).toBeInTheDocument();
    expect(screen.getByText('IT-A02保存済みタスク')).toBeInTheDocument();

    navigateTo('積み上げ状況');
    expect(screen.getByText('締切集中型')).toBeInTheDocument();

    navigateTo('診断');
    expect(screen.getByText('IT-A02説明')).toBeInTheDocument();
    expect(screen.getByText('IT-A02特徴')).toBeInTheDocument();
    expect(screen.getByText('IT-A02おすすめ')).toBeInTheDocument();
  });
});

describe('IT-A03 旧形式タスクの移行', () => {
  it('IT-A03 旧形式タスクを移行し、編集・完了切替・削除できる', async () => {
    vi.stubGlobal('crypto', {
      randomUUID: vi
        .fn()
        .mockReturnValueOnce('generated-it-a03-1')
        .mockReturnValueOnce('generated-it-a03-2'),
    });
    localStorage.setItem(
      TASKS_STORAGE_KEY,
      JSON.stringify([
        {
          name: 'IT-A03 idなしタスク',
          deadline: todayString(),
          estimatedMinutes: 20,
          priority: 5,
          completed: false,
        },
        {
          id: '',
          name: 'IT-A03 空idタスク',
          deadline: todayString(),
          estimatedMinutes: 25,
          importance: 2,
          completed: false,
        },
        task({
          id: 'it-a03-current',
          name: 'IT-A03 現行タスク',
          importance: 3,
        }),
      ]),
    );

    renderApp('/tasks');

    expect(screen.getByText('IT-A03 idなしタスク')).toBeInTheDocument();
    expect(screen.getByText('IT-A03 空idタスク')).toBeInTheDocument();

    await waitForStoredTasks((tasks) => {
      const ids = tasks.map(({ id }) => id);
      return (
        ids.every((id) => id.trim() !== '') &&
        new Set(ids).size === ids.length &&
        tasks.some((item) => item.name === 'IT-A03 idなしタスク' && item.importance === 5)
      );
    });

    clickActionInItem('IT-A03 idなしタスク', '編集');
    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 0,
      behavior: 'smooth',
    });
    fillTaskForm({ name: 'IT-A03 編集後タスク', estimatedMinutes: '35' });
    saveTaskForm();

    await waitFor(() => {
      expect(screen.getByText('IT-A03 編集後タスク')).toBeInTheDocument();
      expect(screen.queryByText('IT-A03 idなしタスク')).not.toBeInTheDocument();
    });

    clickActionInItem('IT-A03 空idタスク', '完了にする');
    fireEvent.click(screen.getByRole('tab', { name: /^完了タスク/ }));
    expect(screen.getByText('IT-A03 空idタスク')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: /^未完了タスク/ }));
    clickActionInItem('IT-A03 編集後タスク', '削除');
    await waitFor(() => {
      expect(screen.queryByText('IT-A03 編集後タスク')).not.toBeInTheDocument();
      expect(storedTasks().some((item) => item.name === 'IT-A03 編集後タスク')).toBe(
        false,
      );
    });
  });
});

describe('IT-A10 データリセット', () => {
  it('IT-A10 キャンセルした場合は保存済みデータを維持する', async () => {
    const confirmMock = vi.spyOn(window, 'confirm').mockReturnValue(false);
    const storedTask = task({ id: 'it-a10-task', name: 'IT-A10独自タスク' });
    const storedSchedule = schedule({ title: 'IT-A10独自予定' });
    const storedResult = diagnosisResult({ typeName: '気分変動型' });
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify([storedTask]));
    localStorage.setItem(SCHEDULES_STORAGE_KEY, JSON.stringify([storedSchedule]));
    localStorage.setItem(DIAGNOSIS_STORAGE_KEY, JSON.stringify(storedResult));

    renderApp();
    fireEvent.click(screen.getByRole('button', { name: 'データをリセット' }));

    expect(confirmMock).toHaveBeenCalledTimes(1);
    expect(screen.getByText('IT-A10独自タスク')).toBeInTheDocument();
    expect(screen.getByText('IT-A10独自予定')).toBeInTheDocument();
    expect(storedTasks()).toEqual([storedTask]);
    expect(storedSchedules()).toEqual([storedSchedule]);
    expect(storedDiagnosis()).toEqual(storedResult);
  });

  it('IT-A10 OKした場合は初期状態へ戻りlocalStorageも更新される', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    localStorage.setItem(
      TASKS_STORAGE_KEY,
      JSON.stringify([task({ id: 'it-a10-task', name: 'IT-A10削除対象タスク' })]),
    );
    localStorage.setItem(
      SCHEDULES_STORAGE_KEY,
      JSON.stringify([schedule({ title: 'IT-A10削除対象予定' })]),
    );
    localStorage.setItem(
      DIAGNOSIS_STORAGE_KEY,
      JSON.stringify(diagnosisResult({ typeName: 'コツコツ型' })),
    );

    const view = renderApp();
    fireEvent.click(screen.getByRole('button', { name: 'データをリセット' }));

    await waitFor(() => {
      expect(screen.queryByText('IT-A10削除対象タスク')).not.toBeInTheDocument();
      expect(screen.queryByText('IT-A10削除対象予定')).not.toBeInTheDocument();
      expect(storedTasks()).toEqual(sampleTasks);
      expect(storedSchedules()).toEqual(sampleSchedules);
      expect(localStorage.getItem(DIAGNOSIS_STORAGE_KEY)).toBeNull();
    });

    view.unmount();
    renderApp('/tasks');
    expect(screen.getByText(sampleTasks[0].name)).toBeInTheDocument();
    expect(screen.queryByText('IT-A10削除対象タスク')).not.toBeInTheDocument();
  });
});
