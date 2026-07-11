import { afterEach, describe, expect, it, vi } from 'vitest';
import { createTaskId } from './taskId';

const originalCrypto = globalThis.crypto;

describe('createTaskId', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('crypto.randomUUIDがある場合はその値を返す', () => {
    vi.stubGlobal('crypto', {
      randomUUID: vi.fn(() => '00000000-0000-4000-8000-000000000000'),
    });

    expect(createTaskId()).toBe('00000000-0000-4000-8000-000000000000');
  });

  it('cryptoがない場合は日時と乱数からIDを作る', () => {
    vi.stubGlobal('crypto', undefined);
    vi.spyOn(Date, 'now').mockReturnValue(1234567890);
    vi.spyOn(Math, 'random').mockReturnValue(0.5);

    expect(createTaskId()).toBe('task-1234567890-i');
  });

  it('crypto.randomUUIDが関数でない場合はフォールバックする', () => {
    vi.stubGlobal('crypto', { randomUUID: undefined });
    vi.spyOn(Date, 'now').mockReturnValue(9876543210);
    vi.spyOn(Math, 'random').mockReturnValue(0.25);

    expect(createTaskId()).toBe('task-9876543210-9');
  });

  it('テスト後に元のcryptoを復元できる', () => {
    vi.stubGlobal('crypto', originalCrypto);

    expect(globalThis.crypto).toBe(originalCrypto);
  });
});
