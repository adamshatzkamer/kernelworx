/**
 * Tests for PublicSettingsShareSection.
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PublicSettingsShareSection } from '../../../src/components/public/PublicSettingsShareSection';

describe('PublicSettingsShareSection', () => {
  it('renders the campaign-scoped share path when a token exists', () => {
    render(
      <PublicSettingsShareSection
        campaignId="CAMPAIGN#campaign-456"
        shareToken="tok-1"
        campaignName="Spring Sale"
      />,
    );
    expect(screen.getByText('Share Link for Spring Sale')).toBeInTheDocument();
    expect(
      screen.getByText('/o/CAMPAIGN#campaign-456/tok-1'),
    ).toBeInTheDocument();
  });

  it('explains the missing link when no token has been generated', () => {
    render(
      <PublicSettingsShareSection
        campaignId="CAMPAIGN#campaign-456"
        shareToken={null}
        campaignName="Spring Sale"
      />,
    );
    expect(
      screen.getByText(/Share link not available/),
    ).toBeInTheDocument();
  });
});
