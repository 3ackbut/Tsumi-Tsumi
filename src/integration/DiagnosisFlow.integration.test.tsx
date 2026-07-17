import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  DIAGNOSIS_STORAGE_KEY,
  TASKS_STORAGE_KEY,
  addDays,
  formatDate,
  navigateTo,
  renderApp,
  storedDiagnosis,
  task,
} from './testUtils';

const planAnswers = [
  '期限や量を見て計画表を作る',
  '予定通りに始められたとき',
  '手順に分けてから進める',
  '優先順位と予定の見通し',
  '計画を組み直して調整する',
  '予定通りに終わったとき',
  '先の見通しをもっと立てたい',
];

function answerQuestion(index: number) {
  const question = screen.getByText(new RegExp(`Q${index + 1}\\.`));
  const card = question.closest('article');

  if (card === null) {
    throw new Error(`Question card ${index + 1} was not found`);
  }

  fireEvent.click(within(card).getByRole('button', { name: planAnswers[index] }));
}

describe('IT-A09 診断結果の連携', () => {
  it('IT-A09 診断結果を保存し、Home・Status・Tasks・Calendar・localStorageへ反映する', async () => {
    const deadline = formatDate(addDays(new Date(), 5));
    localStorage.setItem(
      TASKS_STORAGE_KEY,
      JSON.stringify([
        task({
          id: 'it-a09-task',
          name: 'IT-A09 診断連携タスク',
          deadline,
          estimatedMinutes: 45,
          importance: 2,
        }),
      ]),
    );
    const view = renderApp('/diagnosis');

    planAnswers.slice(0, 6).forEach((_, index) => answerQuestion(index));
    expect(screen.getByRole('button', { name: '診断結果を保存' })).toBeDisabled();
    expect(localStorage.getItem(DIAGNOSIS_STORAGE_KEY)).toBeNull();

    answerQuestion(6);
    fireEvent.click(screen.getByRole('button', { name: '診断結果を保存' }));

    await waitFor(() => {
      expect(screen.getByText('計画型')).toBeInTheDocument();
      expect(screen.getByText(/全体像をつかみ/)).toBeInTheDocument();
      expect(screen.getByText(/優先順位やスケジュール/)).toBeInTheDocument();
      expect(screen.getByText(/まず今日やるタスクを3つ/)).toBeInTheDocument();
      expect(storedDiagnosis()?.typeName).toBe('計画型');
    });

    navigateTo('ホーム');
    expect(screen.getByText(/今のペースを維持|締切が近いものから/)).toBeInTheDocument();

    navigateTo('積み上げ状況');
    expect(screen.getByText('計画型')).toBeInTheDocument();
    expect(screen.getByText(/計画を立てて進めやすいタイプ/)).toBeInTheDocument();

    navigateTo('タスク管理');
    expect(screen.getByText('IT-A09 診断連携タスク')).toBeInTheDocument();
    expect(screen.getByText(/計画型の診断結果/)).toBeInTheDocument();

    navigateTo('カレンダー');
    expect(screen.getByRole('heading', { level: 2, name: '推定つみ度' })).toBeInTheDocument();
    expect(screen.getAllByText(/理由:/).length).toBeGreaterThan(0);

    view.unmount();
    renderApp('/diagnosis');
    expect(screen.getByText('計画型')).toBeInTheDocument();
  });
});

