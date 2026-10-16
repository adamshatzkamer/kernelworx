import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing/react';
import type { ReactNode } from 'react';
import { useCampaignPublicOrderSettings } from '../../src/hooks/useCampaignPublicOrderSettings';

describe('useCampaignPublicOrderSettings', () => {
  it('should be defined', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <MockedProvider mocks={[]} addTypename={false}>
        {children}
      </MockedProvider>
    );
    const { result } = renderHook(() => useCampaignPublicOrderSettings({ campaignId: 'test' }), { wrapper });
    expect(result.current).toBeDefined();
  });

  it('exposes a not-updating state when no mutation is in flight', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <MockedProvider mocks={[]} addTypename={false}>
        {children}
      </MockedProvider>
    );
    const { result } = renderHook(() => useCampaignPublicOrderSettings({ campaignId: 'test' }), { wrapper });
    expect(result.current.updating).toBe(false);
  });
});
