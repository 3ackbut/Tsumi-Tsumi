import { describe, expect, it } from 'vitest';
import type { DiagnosisResult } from '../types/diagnosis';
import type { Task } from '../types/task';
import { judgeAutoPriority } from './taskPriority';

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

describe('judgeAutoPriority', () => {
  it.each([
    {
      label: '過去',
      deadline: '2026-07-10',
      expectedLevel: '中',
      reasonText: '締切を過ぎており',
    },
    {
      label: '今日',
      deadline: '2026-07-11',
      expectedLevel: '高',
      reasonText: '締切が近く、重要度も高い',
    },
    {
      label: '1日後',
      deadline: '2026-07-12',
      expectedLevel: '高',
      reasonText: '締切が近く、重要度も高い',
    },
    {
      label: '3日後',
      deadline: '2026-07-14',
      expectedLevel: '低',
      reasonText: '標準ルール',
    },
    {
      label: '7日後',
      deadline: '2026-07-18',
      expectedLevel: '低',
      reasonText: '標準ルール',
    },
    {
      label: '8日後',
      deadline: '2026-07-19',
      expectedLevel: '低',
      reasonText: '標準ルール',
    },
  ])(
    '締切が$labelの場合に締切分岐を反映する',
    ({ deadline, expectedLevel, reasonText }) => {
      const result = judgeAutoPriority(
        task({
          deadline,
          importance: deadline === '2026-07-11' || deadline === '2026-07-12' ? 4 : 1,
        }),
        null,
        baseDate,
      );

      expect(result.level).toBe(expectedLevel);
      expect(result.reason).toContain(reasonText);
    },
  );

  it.each([
    { estimatedMinutes: 30, expectedLevel: '低' },
    { estimatedMinutes: 31, expectedLevel: '低' },
    { estimatedMinutes: 60, expectedLevel: '低' },
    { estimatedMinutes: 119, expectedLevel: '低' },
    { estimatedMinutes: 120, expectedLevel: '低' },
    { estimatedMinutes: 179, expectedLevel: '低' },
    { estimatedMinutes: 180, expectedLevel: '低' },
  ])(
    '見積時間$estimatedMinutes分の境界で優先度を判定する',
    ({ estimatedMinutes, expectedLevel }) => {
      const result = judgeAutoPriority(
        task({ estimatedMinutes, deadline: '2026-07-19', importance: 1 }),
        null,
        baseDate,
      );

      expect(result.level).toBe(expectedLevel);
    },
  );

  it.each([
    { importance: 3, deadline: '2026-07-12', expectedLevel: '高' },
    { importance: 2, deadline: '2026-07-14', expectedLevel: '中' },
    { importance: 1, deadline: '2026-07-14', expectedLevel: '低' },
  ])(
    '優先度の高・中・低の境界を判定する',
    ({ importance, deadline, expectedLevel }) => {
      const result = judgeAutoPriority(
        task({ importance, deadline, estimatedMinutes: 31 }),
        null,
        baseDate,
      );

      expect(result.level).toBe(expectedLevel);
    },
  );

  it.each([
    {
      typeName: '計画型',
      deadline: '2026-07-16',
      estimatedMinutes: 31,
      expectedReason: '計画型の診断結果',
    },
    {
      typeName: '締切集中型',
      deadline: '2026-07-14',
      estimatedMinutes: 31,
      expectedReason: '締切集中型の診断結果',
    },
    {
      typeName: '気分変動型',
      deadline: '2026-07-19',
      estimatedMinutes: 30,
      expectedReason: '気分変動型の診断結果',
    },
    {
      typeName: 'コツコツ型',
      deadline: '2026-07-19',
      estimatedMinutes: 30,
      expectedReason: 'コツコツ型の診断結果',
    },
    {
      typeName: '未知タイプ',
      deadline: '2026-07-19',
      estimatedMinutes: 31,
      expectedReason: '標準ルール',
    },
  ])(
    '診断結果$typeNameを理由文に反映する',
    ({ typeName, deadline, estimatedMinutes, expectedReason }) => {
      const result = judgeAutoPriority(
        task({ deadline, estimatedMinutes, importance: 1 }),
        diagnosis(typeName),
        baseDate,
      );

      expect(result.reason).toContain(expectedReason);
    },
  );

  it('重要度が高い場合の理由を返す', () => {
    const result = judgeAutoPriority(
      task({ importance: 4, deadline: '2026-07-19', estimatedMinutes: 31 }),
      null,
      baseDate,
    );

    expect(result.level).toBe('中');
    expect(result.reason).toContain('重要度が高い');
  });

  it('見積時間が長い場合の理由を返す', () => {
    const result = judgeAutoPriority(
      task({ importance: 1, deadline: '2026-07-19', estimatedMinutes: 120 }),
      null,
      baseDate,
    );

    expect(result.level).toBe('低');
    expect(result.reason).toContain('見積時間が長く');
  });
});
