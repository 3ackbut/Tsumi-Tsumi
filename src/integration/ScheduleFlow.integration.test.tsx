import { screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  SCHEDULES_STORAGE_KEY,
  TASKS_STORAGE_KEY,
  clickActionInItem,
  fillScheduleForm,
  navigateTo,
  renderApp,
  saveScheduleForm,
  storedSchedules,
  todayString,
  waitForStoredSchedules,
} from './testUtils';

describe('IT-A08 予定の追加・編集・削除', () => {
  it('IT-A08 時刻境界値を確認し、予定を追加してCalendar・Home・localStorageへ反映する', async () => {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify([]));
    localStorage.setItem(SCHEDULES_STORAGE_KEY, JSON.stringify([]));
    renderApp('/calendar');

    fillScheduleForm({
      title: 'IT-A08 不正予定',
      date: todayString(),
      startTime: '10:00',
      endTime: '09:59',
    });
    saveScheduleForm();

    expect(
      screen.getByText('終了時刻は開始時刻より後にしてください'),
    ).toBeInTheDocument();
    expect(storedSchedules()).toEqual([]);

    fillScheduleForm({
      title: 'IT-A08 同時刻予定',
      date: todayString(),
      startTime: '10:00',
      endTime: '10:00',
    });
    saveScheduleForm();

    expect(
      screen.getByText('終了時刻は開始時刻より後にしてください'),
    ).toBeInTheDocument();
    expect(storedSchedules()).toEqual([]);

    fillScheduleForm({
      title: 'IT-A08 追加予定',
      date: todayString(),
      startTime: '10:00',
      endTime: '10:01',
    });
    saveScheduleForm();

    await waitForStoredSchedules(
      (schedules) =>
        schedules.length === 1 &&
        schedules[0].title === 'IT-A08 追加予定' &&
        schedules[0].startTime === '10:00' &&
        schedules[0].endTime === '10:01',
    );
    expect(screen.getByText('IT-A08 追加予定')).toBeInTheDocument();

    navigateTo('ホーム');
    expect(screen.getByText('IT-A08 追加予定')).toBeInTheDocument();
  });

  it('IT-A08 予定を編集し、重複せずCalendar・Home・localStorageへ反映する', async () => {
    localStorage.setItem(
      SCHEDULES_STORAGE_KEY,
      JSON.stringify([
        {
          title: 'IT-A08 編集前予定',
          date: todayString(),
          startTime: '13:00',
          endTime: '14:00',
        },
      ]),
    );
    renderApp('/calendar');

    clickActionInItem('IT-A08 編集前予定', '編集');

    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 0,
      behavior: 'smooth',
    });
    expect(screen.getByLabelText('予定名')).toHaveValue('IT-A08 編集前予定');
    expect(screen.getByLabelText('開始時刻')).toHaveValue('13:00');

    fillScheduleForm({
      title: 'IT-A08 編集後予定',
      startTime: '15:00',
      endTime: '16:00',
    });
    saveScheduleForm();

    await waitFor(() => {
      expect(screen.getByText('IT-A08 編集後予定')).toBeInTheDocument();
      expect(screen.queryByText('IT-A08 編集前予定')).not.toBeInTheDocument();
      expect(storedSchedules()).toEqual([
        {
          title: 'IT-A08 編集後予定',
          date: todayString(),
          startTime: '15:00',
          endTime: '16:00',
        },
      ]);
    });

    navigateTo('ホーム');
    expect(screen.getByText('IT-A08 編集後予定')).toBeInTheDocument();
  });

  it('IT-A08 予定削除のキャンセルとOKを確認する', async () => {
    const confirmMock = vi.spyOn(window, 'confirm');
    localStorage.setItem(
      SCHEDULES_STORAGE_KEY,
      JSON.stringify([
        {
          title: 'IT-A08 削除予定',
          date: todayString(),
          startTime: '17:00',
          endTime: '18:00',
        },
      ]),
    );
    renderApp('/calendar');

    confirmMock.mockReturnValueOnce(false);
    clickActionInItem('IT-A08 削除予定', '削除');

    expect(screen.getByText('IT-A08 削除予定')).toBeInTheDocument();
    expect(storedSchedules()).toHaveLength(1);

    confirmMock.mockReturnValueOnce(true);
    clickActionInItem('IT-A08 削除予定', '削除');

    await waitFor(() => {
      expect(screen.queryByText('IT-A08 削除予定')).not.toBeInTheDocument();
      expect(storedSchedules()).toEqual([]);
    });

    navigateTo('ホーム');
    expect(screen.queryByText('IT-A08 削除予定')).not.toBeInTheDocument();
  });
});

