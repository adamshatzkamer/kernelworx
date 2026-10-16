/**
 * Tests for PublicSettingsMethodChecklist.
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PublicSettingsMethodChecklist } from '../../../src/components/public/PublicSettingsMethodChecklist';

describe('PublicSettingsMethodChecklist', () => {
  it('checks the methods present in the allowed list', () => {
    render(
      <PublicSettingsMethodChecklist allowedPaymentMethods={['Cash', 'Visa']} onChange={vi.fn()} />,
    );
    expect(screen.getByRole('checkbox', { name: 'Cash' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Visa' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Check' })).not.toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Discover' })).not.toBeChecked();
  });

  it('adds a method when an unchecked box is clicked', () => {
    const onChange = vi.fn();
    render(
      <PublicSettingsMethodChecklist allowedPaymentMethods={['Cash']} onChange={onChange} />,
    );
    fireEvent.click(screen.getByRole('checkbox', { name: 'MasterCard' }));
    expect(onChange).toHaveBeenCalledWith(['Cash', 'MasterCard']);
  });

  it('removes a method when a checked box is clicked', () => {
    const onChange = vi.fn();
    render(
      <PublicSettingsMethodChecklist
        allowedPaymentMethods={['Cash', 'Check']}
        onChange={onChange}
      />,
    );
    fireEvent.click(screen.getByRole('checkbox', { name: 'Cash' }));
    expect(onChange).toHaveBeenCalledWith(['Check']);
  });

  it('disables all checkboxes when disabled', () => {
    render(
      <PublicSettingsMethodChecklist
        allowedPaymentMethods={[]}
        onChange={vi.fn()}
        disabled
      />,
    );
    for (const name of ['Cash', 'Check', 'Visa', 'MasterCard', 'American Express', 'Discover']) {
      expect(screen.getByRole('checkbox', { name })).toBeDisabled();
    }
  });
});
