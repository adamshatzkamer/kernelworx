import { render, screen } from '@testing-library/react';
import { PublicOrderPage } from '../pages/PublicOrderPage';

describe('PublicOrderPage', () => {
  it('renders without crashing', () => {
    // We need to mock the route parameters
    // For now, we just render the component
    render(<PublicOrderPage match={{ params: { campaignId: 'test', token: 'test' } }} />);
    expect(screen.getByText(/public order/i)).toBeInTheDocument();
  });
});
