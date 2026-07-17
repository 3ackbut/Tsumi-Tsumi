import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  SCHEDULES_STORAGE_KEY,
  TASKS_STORAGE_KEY,
  clickActionInItem,
  fillTaskForm,
  navigateTo,
  renderApp,
  saveTaskForm,
  storedTasks,
  task,
  todayString,
  waitForStoredTasks,
} from './testUtils';

describe('IT-A04 タスク追加と画面間連携', () => {
  it('IT-A04 入力エラーと境界値を確認し、追加タスクを各画面とlocalStorageへ反映する', async () => {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify([]));
    localStorage.setItem(SCHEDULES_STORAGE_KEY, JSON.stringify([]));
    const view = renderApp('/tasks');

    fillTaskForm({
      name: 'IT-A04 見積0タスク',
      deadline: todayString(),
      estimatedMinutes: '0',
      importance: '3',
    });
    saveTaskForm();

    expect(screen.getByText('見積時間は1分以上にしてください')).toBeInTheDocument();
    expect(screen.queryByText('IT-A04 見積0タスク')).not.toBeInTheDocument();
    expect(storedTasks()).toEqual([]);

    fillTaskForm({
      name: 'IT-A04 境界タスク1',
      deadline: todayString(),
      estimatedMinutes: '1',
      importance: '1',
    });
    saveTaskForm();

    await waitFor(() => {
      expect(screen.getByText('IT-A04 境界タスク1')).toBeInTheDocument();
    });

    fillTaskForm({
      name: 'IT-A04 境界タスク5',
      deadline: todayString(),
      estimatedMinutes: '30',
      importance: '5',
    });
    saveTaskForm();

    await waitForStoredTasks(
      (tasks) =>
        tasks.some(
          (item) =>
            item.name === 'IT-A04 境界タスク1' &&
            item.estimatedMinutes === 1 &&
            item.importance === 1,
        ) &&
        tasks.some(
          (item) =>
            item.name === 'IT-A04 境界タスク5' &&
            item.estimatedMinutes === 30 &&
            item.importance === 5,
        ),
    );

    navigateTo('ホーム');
    expect(screen.getByText('IT-A04 境界タスク1')).toBeInTheDocument();
    expect(screen.getByText('IT-A04 境界タスク5')).toBeInTheDocument();
    expect(screen.getAllByText('2').length).toBeGreaterThan(0);

    navigateTo('カレンダー');
    expect(screen.getByText('IT-A04 境界タスク1')).toBeInTheDocument();
    expect(screen.getByText('IT-A04 境界タスク5')).toBeInTheDocument();

    navigateTo('積み上げ状況');
    expect(screen.getByText('未完了数')).toBeInTheDocument();
    expect(screen.getByText('31分')).toBeInTheDocument();
    expect(screen.getByLabelText(/つみ度/)).toBeInTheDocument();

    view.unmount();
    renderApp('/tasks');
    expect(screen.getByText('IT-A04 境界タスク1')).toBeInTheDocument();
    expect(screen.getByText('IT-A04 境界タスク5')).toBeInTheDocument();
  });
});

describe('IT-A05 タスク編集', () => {
  it('IT-A05 既存タスクを編集し、id維持・画面反映・localStorage保存を確認する', async () => {
    localStorage.setItem(
      TASKS_STORAGE_KEY,
      JSON.stringify([
        task({
          id: 'it-a05-task',
          name: 'IT-A05 編集前タスク',
          deadline: todayString(),
          estimatedMinutes: 40,
          importance: 3,
        }),
      ]),
    );
    renderApp('/tasks');

    clickActionInItem('IT-A05 編集前タスク', '編集');

    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 0,
      behavior: 'smooth',
    });
    expect(screen.getByLabelText('タスク名')).toHaveValue('IT-A05 編集前タスク');
    expect(screen.getByLabelText('見積時間（分）')).toHaveValue(40);

    fillTaskForm({
      name: 'IT-A05 編集後タスク',
      estimatedMinutes: '75',
      importance: '5',
    });
    saveTaskForm();

    await waitForStoredTasks(
      (tasks) =>
        tasks.length === 1 &&
        tasks[0].id === 'it-a05-task' &&
        tasks[0].name === 'IT-A05 編集後タスク' &&
        tasks[0].estimatedMinutes === 75,
    );

    expect(screen.getByText('IT-A05 編集後タスク')).toBeInTheDocument();
    expect(screen.queryByText('IT-A05 編集前タスク')).not.toBeInTheDocument();

    navigateTo('ホーム');
    expect(screen.getByText('IT-A05 編集後タスク')).toBeInTheDocument();

    navigateTo('カレンダー');
    expect(screen.getByText('IT-A05 編集後タスク')).toBeInTheDocument();

    navigateTo('積み上げ状況');
    expect(screen.getByText('75分')).toBeInTheDocument();
    expect(screen.getByLabelText(/つみ度/)).toBeInTheDocument();
  });
});

describe('IT-A06 タスク完了・未完了切り替え', () => {
  it('IT-A06 完了状態を切り替え、タブ・各画面・localStorageへ反映する', async () => {
    localStorage.setItem(
      TASKS_STORAGE_KEY,
      JSON.stringify([
        task({
          id: 'it-a06-task',
          name: 'IT-A06 切替タスク',
          deadline: todayString(),
          estimatedMinutes: 50,
          importance: 4,
          completed: false,
        }),
      ]),
    );
    renderApp('/tasks');

    clickActionInItem('IT-A06 切替タスク', '完了にする');
    await waitForStoredTasks(
      (tasks) => tasks[0]?.name === 'IT-A06 切替タスク' && tasks[0].completed,
    );

    fireEvent.click(screen.getByRole('tab', { name: /^完了タスク/ }));
    expect(screen.getByText('IT-A06 切替タスク')).toBeInTheDocument();

    navigateTo('ホーム');
    expect(screen.getByText('未完了')).toBeInTheDocument();
    expect(screen.getAllByText('完了').length).toBeGreaterThan(0);
    expect(screen.getByText('0%')).toBeInTheDocument();

    navigateTo('積み上げ状況');
    expect(screen.getByText('100%')).toBeInTheDocument();
    expect(screen.getByText('0分')).toBeInTheDocument();
    expect(screen.getByLabelText('つみ度 0%')).toBeInTheDocument();

    navigateTo('カレンダー');
    expect(screen.getByText('完了')).toBeInTheDocument();

    navigateTo('タスク管理');
    fireEvent.click(screen.getByRole('tab', { name: /^完了タスク/ }));
    clickActionInItem('IT-A06 切替タスク', '未完了に戻す');

    await waitForStoredTasks(
      (tasks) => tasks[0]?.name === 'IT-A06 切替タスク' && !tasks[0].completed,
    );
    fireEvent.click(screen.getByRole('tab', { name: /^未完了タスク/ }));
    expect(screen.getByText('IT-A06 切替タスク')).toBeInTheDocument();
  });
});

describe('IT-A07 タスク削除', () => {
  it('IT-A07 対象タスクだけを削除し、各画面とlocalStorageへ反映する', async () => {
    localStorage.setItem(
      TASKS_STORAGE_KEY,
      JSON.stringify([
        task({
          id: 'it-a07-delete',
          name: 'IT-A07 削除対象タスク',
          deadline: todayString(),
          estimatedMinutes: 60,
        }),
        task({
          id: 'it-a07-keep',
          name: 'IT-A07 残すタスク',
          deadline: todayString(),
          estimatedMinutes: 30,
        }),
      ]),
    );
    const view = renderApp('/tasks');

    clickActionInItem('IT-A07 削除対象タスク', '削除');

    await waitFor(() => {
      expect(screen.queryByText('IT-A07 削除対象タスク')).not.toBeInTheDocument();
      expect(screen.getByText('IT-A07 残すタスク')).toBeInTheDocument();
      expect(storedTasks()).toHaveLength(1);
      expect(storedTasks()[0].name).toBe('IT-A07 残すタスク');
    });

    navigateTo('ホーム');
    expect(screen.queryByText('IT-A07 削除対象タスク')).not.toBeInTheDocument();
    expect(screen.getByText('IT-A07 残すタスク')).toBeInTheDocument();

    navigateTo('カレンダー');
    expect(screen.queryByText('IT-A07 削除対象タスク')).not.toBeInTheDocument();
    expect(screen.getByText('IT-A07 残すタスク')).toBeInTheDocument();

    navigateTo('積み上げ状況');
    expect(screen.getByText('30分')).toBeInTheDocument();

    view.unmount();
    renderApp('/tasks');
    expect(screen.queryByText('IT-A07 削除対象タスク')).not.toBeInTheDocument();
    expect(screen.getByText('IT-A07 残すタスク')).toBeInTheDocument();
  });
});
