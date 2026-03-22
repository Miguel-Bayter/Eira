import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { JournalFormattedAnalysis } from '../../../src/components/journal/JournalFormattedAnalysis';

describe('JournalFormattedAnalysis', () => {
  it('renders markdown emphasis as strong text without using HTML injection', () => {
    const { container } = render(
      <p>
        <JournalFormattedAnalysis content={'**Emotions**: calm\n<script>alert(1)</script>'} />
      </p>,
    );

    expect(screen.getByText('Emotions').tagName).toBe('STRONG');
    expect(container).toHaveTextContent('<script>alert(1)</script>');
    expect(container.querySelector('script')).toBeNull();
  });

  it('keeps plain text untouched when there is no markdown emphasis', () => {
    render(
      <p>
        <JournalFormattedAnalysis content={'Patterns detected: stable mood.'} />
      </p>,
    );

    expect(screen.getByText('Patterns detected: stable mood.')).toBeInTheDocument();
  });
});
