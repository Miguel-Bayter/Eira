import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { BreathingGame } from '@/components/games/BreathingGame';

function renderGame(onComplete = vi.fn()) {
  return render(<BreathingGame onComplete={onComplete} />);
}

describe('BreathingGame', () => {
  it('shows Start button on load', () => {
    renderGame();
    expect(screen.getByRole('button', { name: /games\.start/i })).toBeInTheDocument();
  });

  it('shows Pause button when game is active', async () => {
    const user = userEvent.setup();
    renderGame();
    await user.click(screen.getByRole('button', { name: /games\.start/i }));
    expect(screen.getByRole('button', { name: /games\.pause/i })).toBeInTheDocument();
  });

  it('shows cycle indicator', () => {
    renderGame();
    // The cycle indicator is now 5 progress dots (one per cycle)
    const dots = document.querySelectorAll('.flex.items-center.gap-2 > div');
    expect(dots.length).toBe(5);
  });

  it('NO INLINE CSS — no color/margin/padding style props', () => {
    const { container } = renderGame();
    const styledEls = container.querySelectorAll('[style]');
    styledEls.forEach((el) => {
      expect(el.getAttribute('style')).not.toMatch(
        /color:|background:|font-size:|margin:|padding:/,
      );
    });
  });
});
