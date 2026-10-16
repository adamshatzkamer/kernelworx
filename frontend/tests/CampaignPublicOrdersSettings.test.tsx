import { render, screen } from '@testing-library/react';
import { CampaignPublicOrdersSettings } from '../pages/CampaignSettingsPage'; // Adjust the import as needed

describe('CampaignPublicOrdersSettings', () => {
  it('renders without crashing', () => {
    render(<CampaignPublicOrdersSettings campaignId="test-campaign-id" />);
    expect(screen.getByText(/public orders/i)).toBeInTheDocument();
  });
});
