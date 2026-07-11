import { describe, expect, it } from 'vitest';
import type { DiagnosisResult } from '../types/diagnosis';
import { getHomeAdvice } from './homeAdvice';

const diagnosis = (typeName: string): DiagnosisResult => ({
  typeName,
  description: '',
  feature: '',
  recommendation: '',
  diagnosedAt: '2026-07-11T00:00:00.000Z',
});

describe('getHomeAdvice', () => {
  it.each([
    {
      typeName: null,
      score: 49,
      expected: '余裕があるうちに未完了タスクを確認しましょう。',
    },
    {
      typeName: null,
      score: 50,
      expected: '現在のつみ度に応じて未完了タスクを整理しましょう。',
    },
    {
      typeName: '計画型',
      score: 49,
      expected: '今のペースを維持しましょう。',
    },
    {
      typeName: '計画型',
      score: 50,
      expected: '締切が近いものから順番に並べて',
    },
    {
      typeName: '締切集中型',
      score: 49,
      expected: '締切が近いタスクを1つだけ進めておきましょう。',
    },
    {
      typeName: '締切集中型',
      score: 50,
      expected: '今日中に終わらせるタスクを1つ選び',
    },
    {
      typeName: '気分変動型',
      score: 49,
      expected: '気分が乗るタスクから軽く進めましょう。',
    },
    {
      typeName: '気分変動型',
      score: 50,
      expected: '5〜15分で終わる小さいタスク',
    },
    {
      typeName: 'コツコツ型',
      score: 49,
      expected: '今の積み重ねを続けましょう。',
    },
    {
      typeName: 'コツコツ型',
      score: 50,
      expected: 'タスクを小さく分けて',
    },
    {
      typeName: '未知タイプ',
      score: 50,
      expected: '現在のつみ度に応じて未完了タスクを整理しましょう。',
    },
  ])(
    '診断$typeName、つみ度$scoreの助言を返す',
    ({ typeName, score, expected }) => {
      const result = getHomeAdvice(
        typeName === null ? null : diagnosis(typeName),
        score,
      );

      expect(result).toContain(expected);
    },
  );
});
