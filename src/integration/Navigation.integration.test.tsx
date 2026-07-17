import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderApp } from './testUtils';

const navigationCases = [
  { label: 'タスク管理', heading: 'タスク確認', level: 1 },
  { label: 'カレンダー', heading: 'カレンダー', level: 1 },
  { label: '積み上げ状況', heading: '積み上げ状況', level: 1 },
  { label: '診断', heading: '性格診断', level: 1 },
  { label: 'ホーム', heading: 'Tsumi-Tsumi', level: 1 },
];

describe('IT-A11 画面遷移', () => {
  it('IT-A11 ナビゲーションで各画面へ移動し、active状態とスクロール復帰を確認する', async () => {
    renderApp();
    vi.mocked(window.scrollTo).mockClear();

    for (const item of navigationCases) {
      const link = screen.getByRole('link', { name: item.label });
      fireEvent.click(link);

      expect(
        await screen.findByRole('heading', {
          level: item.level,
          name: item.heading,
        }),
      ).toBeInTheDocument();
      expect(link).toHaveClass('nav-link-active');
      await waitFor(() => {
        expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
      });
      vi.mocked(window.scrollTo).mockClear();
    }
  });
});
