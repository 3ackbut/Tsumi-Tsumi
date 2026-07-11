import { describe, expect, it } from 'vitest';
import type { DiagnosisResult } from '../types/diagnosis';
import type { Task } from '../types/task';
import { calculateTsumiScore } from './tsumiScore';

const baseDate = new Date('2026-07-11T12:00:00');

const diagnosis = (typeName: string): DiagnosisResult => ({
  typeName,
  description: '',
  feature: '',
  recommendation: '',
  diagnosedAt: '2026-07-11T00:00:00.000Z',
});

const task = (overrides: Partial<Task> = {}): Task => ({
  id: 'task-1',
  name: 'テストタスク',
  deadline: '2026-07-19',
  estimatedMinutes: 31,
  importance: 1,
  completed: false,
  ...overrides,
});

describe('calculateTsumiScore', () => {
  it('タスク0件の場合はつみ度0を返す', () => {
    const result = calculateTsumiScore([], null, baseDate);

    expect(result).toMatchObject({
      score: 0,
      label: '余裕あり',
      influentialTasks: [],
      breakdown: {
        overdueTaskCount: 0,
        upcomingDeadlineTaskCount: 0,
      },
    });
    expect(result.reasons).toEqual([
      '未完了タスクがないため、つみ度は低い状態です。',
    ]);
  });

  it('全件完了の場合はつみ度0を返す', () => {
    const result = calculateTsumiScore(
      [task({ completed: true })],
      null,
      baseDate,
    );

    expect(result.score).toBe(0);
    expect(result.influentialTasks).toHaveLength(0);
  });

  it('未完了1件の場合はタスク数上限70以下で計算する', () => {
    const result = calculateTsumiScore(
      [
        task({
          deadline: '2026-07-10',
          estimatedMinutes: 180,
          importance: 5,
        }),
      ],
      null,
      baseDate,
    );

    expect(result.score).toBe(42);
    expect(result.label).toBe('少し積み気味');
    expect(result.influentialTasks).toHaveLength(1);
    expect(result.breakdown).toMatchObject({
      overdueTaskCount: 1,
      upcomingDeadlineTaskCount: 0,
    });
  });

  it('複数件の場合は完了済みを除外し、影響タスクを最大3件に絞る', () => {
    const result = calculateTsumiScore(
      [
        task({
          id: 'overdue',
          name: '期限切れ',
          deadline: '2026-07-10',
          estimatedMinutes: 180,
          importance: 5,
        }),
        task({
          id: 'today',
          name: '今日',
          deadline: '2026-07-11',
          estimatedMinutes: 120,
          importance: 4,
        }),
        task({
          id: 'three-days',
          name: '3日後',
          deadline: '2026-07-14',
          estimatedMinutes: 60,
          importance: 3,
        }),
        task({
          id: 'eight-days',
          name: '8日後',
          deadline: '2026-07-19',
          estimatedMinutes: 31,
          importance: 1,
        }),
        task({
          id: 'completed',
          name: '完了済み',
          deadline: '2026-07-09',
          estimatedMinutes: 180,
          importance: 5,
          completed: true,
        }),
      ],
      null,
      baseDate,
    );

    expect(result.score).toBe(74);
    expect(result.label).toBe('注意');
    expect(result.influentialTasks.map(({ task: item }) => item.id)).toEqual([
      'overdue',
      'today',
      'three-days',
    ]);
    expect(result.reasons).toEqual([
      '締切が近い未完了タスクがあります。',
      '期限切れの未完了タスクがあります。',
      '重要度が高い未完了タスクがあります。',
      'TsumiTsumi判定で優先度が高いタスクがあります。',
      '見積時間が長い未完了タスクがあります。',
    ]);
  });

  it.each([
    {
      label: '過去',
      deadline: '2026-07-10',
      overdueTaskCount: 1,
      upcomingDeadlineTaskCount: 0,
    },
    {
      label: '今日',
      deadline: '2026-07-11',
      overdueTaskCount: 0,
      upcomingDeadlineTaskCount: 1,
    },
    {
      label: '1日後',
      deadline: '2026-07-12',
      overdueTaskCount: 0,
      upcomingDeadlineTaskCount: 1,
    },
    {
      label: '3日後',
      deadline: '2026-07-14',
      overdueTaskCount: 0,
      upcomingDeadlineTaskCount: 1,
    },
    {
      label: '7日後',
      deadline: '2026-07-18',
      overdueTaskCount: 0,
      upcomingDeadlineTaskCount: 0,
    },
    {
      label: '8日後',
      deadline: '2026-07-19',
      overdueTaskCount: 0,
      upcomingDeadlineTaskCount: 0,
    },
  ])(
    '締切が$labelの場合にbreakdownへ反映する',
    ({ deadline, overdueTaskCount, upcomingDeadlineTaskCount }) => {
      const result = calculateTsumiScore(
        [task({ deadline })],
        null,
        baseDate,
      );

      expect(result.breakdown).toMatchObject({
        overdueTaskCount,
        upcomingDeadlineTaskCount,
      });
    },
  );

  it.each([
    { estimatedMinutes: 30, expectedScore: 8 },
    { estimatedMinutes: 31, expectedScore: 8 },
    { estimatedMinutes: 60, expectedScore: 10 },
    { estimatedMinutes: 119, expectedScore: 10 },
    { estimatedMinutes: 120, expectedScore: 12 },
    { estimatedMinutes: 179, expectedScore: 12 },
    { estimatedMinutes: 180, expectedScore: 14 },
  ])(
    '見積時間$estimatedMinutes分の境界でつみ度を計算する',
    ({ estimatedMinutes, expectedScore }) => {
      const result = calculateTsumiScore(
        [
          task({
            deadline: '2026-07-19',
            estimatedMinutes,
            importance: 1,
          }),
        ],
        null,
        baseDate,
      );

      expect(result.score).toBe(expectedScore);
    },
  );

  it.each([
    { count: 1, expectedScore: 70 },
    { count: 2, expectedScore: 82 },
    { count: 3, expectedScore: 90 },
    { count: 4, expectedScore: 96 },
    { count: 5, expectedScore: 100 },
  ])(
    '未完了タスク$count件の場合の上限を適用する',
    ({ count, expectedScore }) => {
      const tasks = Array.from({ length: count }, (_, index) =>
        task({
          id: `task-${index}`,
          deadline: '2026-07-10',
          estimatedMinutes: 180,
          importance: 100,
        }),
      );

      const result = calculateTsumiScore(tasks, null, baseDate);

      expect(result.score).toBe(expectedScore);
    },
  );

  it.each([
    { scoreName: '余裕あり', tasks: [task()], expectedLabel: '余裕あり' },
    {
      scoreName: '少し積み気味',
      tasks: [task({ deadline: '2026-07-10', importance: 5, estimatedMinutes: 180 })],
      expectedLabel: '少し積み気味',
    },
    {
      scoreName: '注意',
      tasks: [
        task({ id: '1', deadline: '2026-07-10', importance: 5, estimatedMinutes: 180 }),
        task({ id: '2', deadline: '2026-07-10', importance: 5, estimatedMinutes: 180 }),
      ],
      expectedLabel: '注意',
    },
    {
      scoreName: 'かなり危険',
      tasks: [
        task({ id: '1', deadline: '2026-07-10', importance: 5, estimatedMinutes: 180 }),
        task({ id: '2', deadline: '2026-07-10', importance: 5, estimatedMinutes: 180 }),
        task({ id: '3', deadline: '2026-07-10', importance: 5, estimatedMinutes: 180 }),
      ],
      expectedLabel: 'かなり危険',
    },
    {
      scoreName: '限界に近い',
      tasks: Array.from({ length: 5 }, (_, index) =>
        task({
          id: `task-${index}`,
          deadline: '2026-07-10',
          importance: 5,
          estimatedMinutes: 180,
        }),
      ),
      expectedLabel: '限界に近い',
    },
  ])('$scoreNameのラベルを返す', ({ tasks, expectedLabel }) => {
    const result = calculateTsumiScore(tasks, null, baseDate);

    expect(result.label).toBe(expectedLabel);
  });

  it.each(['計画型', '締切集中型', '気分変動型', 'コツコツ型', '未知タイプ'])(
    '診断結果%sを受け取ってつみ度を返す',
    (typeName) => {
      const result = calculateTsumiScore(
        [task({ deadline: '2026-07-14', estimatedMinutes: 30 })],
        diagnosis(typeName),
        baseDate,
      );

      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
      expect(result.influentialTasks).toHaveLength(1);
    },
  );

  it('理由に該当する要因がない場合は標準理由を返す', () => {
    const result = calculateTsumiScore(
      [task({ deadline: '2026-07-19', estimatedMinutes: 31, importance: 1 })],
      null,
      baseDate,
    );

    expect(result.reasons).toEqual([
      '未完了タスクはありますが、すぐに危険な積み上がりではありません。',
    ]);
  });

  it('影響タスクのスコアが同じ場合は締切が近い順に並べる', () => {
    const result = calculateTsumiScore(
      [
        task({ id: 'later', deadline: '2026-07-19' }),
        task({ id: 'earlier', deadline: '2026-07-18' }),
      ],
      null,
      baseDate,
    );

    expect(result.influentialTasks.map(({ task: item }) => item.id)).toEqual([
      'earlier',
      'later',
    ]);
  });
});
