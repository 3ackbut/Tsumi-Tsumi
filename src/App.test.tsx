import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('App', () => {
  it('ホーム画面を描画できる', () => {
    render(<App />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Tsumi-Tsumi' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('navigation', { name: '画面移動' }),
    ).toBeInTheDocument();
  });
});
