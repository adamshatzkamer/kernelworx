/**
 * Tests for PublicSettingsAckCheckboxes.
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PublicSettingsAckCheckboxes } from '../../../src/components/public/PublicSettingsAckCheckboxes';

describe('PublicSettingsAckCheckboxes', () => {
  it('reflects the accepted state', () => {
    const { rerender } = render(
      <PublicSettingsAckCheckboxes acknowledgementsAccepted onChange={vi.fn()} />,
    );
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
    rerender(
      <PublicSettingsAckCheckboxes acknowledgementsAccepted={false} onChange={vi.fn()} />,
    );
    expect(screen.getByRole('checkbox')).not.toBeChecked();
  });

  it('forwards the checkbox change', () => {
    const onChange = vi.fn();
    render(<PublicSettingsAckCheckboxes acknowledgementsAccepted={false} onChange={onChange} />);
    fireEvent.click(screen.getByRole('checkbox'));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('disables the checkbox when disabled', () => {
    render(
      <PublicSettingsAckCheckboxes
        acknowledgementsAccepted={false}
        onChange={vi.fn()}
        disabled
      />,
    );
    expect(screen.getByRole('checkbox')).toBeDisabled();
  });
});
