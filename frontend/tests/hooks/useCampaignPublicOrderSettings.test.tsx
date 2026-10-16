import { renderHook, act } from '@testing-library/react';
import { useCampaignPublicOrderSettings } from '../../src/hooks/useCampaignPublicOrderSettings';

describe('useCampaignPublicOrderSettings', () => {
  it('should be defined', () => {
    const { result } = renderHook(() => useCampaignPublicOrderSettings({ campaignId: 'test' }));
    expect(result.current).toBeDefined();
  });
});
