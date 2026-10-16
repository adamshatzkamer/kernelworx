/**
 * CampaignSettingsPage public-orders section tests.
 *
 * The campaign settings page hosts the public-order settings UI
 * (share link, capacity notice, acknowledgement checkbox, payment-method
 * checklist, and the save/enable/disable/rotate actions) driven by
 * useCampaignPublicOrderSettings against the campaign-keyed API.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MockedProvider } from '@apollo/client/testing/react';
import type { MockedResponse } from '@apollo/client/testing';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { CampaignSettingsPage } from '../src/pages/CampaignSettingsPage';
import {
  GET_CAMPAIGN,
  LIST_MANAGED_CATALOGS,
  LIST_MY_CATALOGS,
  GET_MY_PAYMENT_METHODS,
  GET_CAMPAIGN_PUBLIC_ORDER_SETTINGS,
  UPDATE_CAMPAIGN_PUBLIC_ORDER_SETTINGS,
} from '../src/lib/graphql';
import type { GqlCampaign as Campaign } from '../src/types';

const PROFILE_ID_RAW = 'profile-123';
const CAMPAIGN_ID_RAW = 'campaign-456';
const PROFILE_ID = `PROFILE#${PROFILE_ID_RAW}`;
const CAMPAIGN_ID = `CAMPAIGN#${CAMPAIGN_ID_RAW}`;
const CATALOG_ID = `CATALOG#catalog-1`;

type CampaignFixture = Omit<Campaign, 'sharedCampaignCode' | 'catalogId' | 'startDate' | 'endDate'> & {
  __typename?: string;
  sharedCampaignCode?: string | null;
  catalogId?: string | null;
  startDate?: string | null;
  endDate?: string | null;
};

const mockCampaign: CampaignFixture = {
  __typename: 'Campaign',
  campaignId: CAMPAIGN_ID,
  profileId: PROFILE_ID,
  campaignName: 'Spring Sale',
  campaignYear: 2025,
  startDate: '2025-03-01T00:00:00.000Z',
  endDate: '2025-03-31T00:00:00.000Z',
  catalogId: CATALOG_ID,
  unitType: 'Pack',
  unitNumber: 101,
  city: 'Springfield',
  state: 'IL',
  sharedCampaignCode: null,
  isActive: true,
  totalOrders: 0,
  totalRevenue: 0,
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
};

const mockCatalog = {
  __typename: 'Catalog',
  catalogId: CATALOG_ID,
  catalogName: 'Official Catalog',
  catalogType: 'ADMIN_MANAGED',
  isPublic: true,
  isDeleted: false,
  products: [],
};

const makeSettings = (overrides: Record<string, unknown> = {}) => ({
  __typename: 'CampaignPublicOrderSettings',
  enabled: true,
  shareToken: 'tok-1',
  allowedPaymentMethods: ['Cash'],
  acknowledgedAt: '2025-01-01T00:00:00.000Z',
  ackVersion: 1,
  publicOrderCount: 3,
  campaignId: CAMPAIGN_ID,
  campaignName: 'Spring Sale',
  campaignState: 'IL',
  ...overrides,
});

const baseMocks = (settings = makeSettings()): MockedResponse[] => [
  {
    request: { query: GET_CAMPAIGN, variables: { campaignId: CAMPAIGN_ID } },
    result: { data: { getCampaign: mockCampaign } },
  },
  {
    request: { query: LIST_MANAGED_CATALOGS },
    result: { data: { listManagedCatalogs: [mockCatalog] } },
  },
  {
    request: { query: LIST_MY_CATALOGS },
    result: { data: { listMyCatalogs: [] } },
  },
  {
    request: { query: GET_CAMPAIGN_PUBLIC_ORDER_SETTINGS, variables: { campaignId: CAMPAIGN_ID } },
    result: { data: { getCampaignPublicOrderSettings: settings } },
  },
  {
    request: { query: GET_MY_PAYMENT_METHODS },
    result: { data: { myPaymentMethods: [] } },
  },
];

function renderPage(mocks: MockedResponse[]) {
  return render(
    <MockedProvider mocks={mocks}>
      <MemoryRouter
        initialEntries={[`/scouts/${PROFILE_ID_RAW}/campaigns/${CAMPAIGN_ID_RAW}/settings`]}
      >
        <Routes>
          <Route
            path="/scouts/:profileId/campaigns/:campaignId/settings"
            element={<CampaignSettingsPage />}
          />
        </Routes>
      </MemoryRouter>
    </MockedProvider>,
  );
}

const settingsVisible = async () => {
  await waitFor(() => {
    expect(screen.getByText('Public Orders')).toBeInTheDocument();
  });
  await waitFor(() => {
    expect(screen.getByText(`/o/${CAMPAIGN_ID}/tok-1`)).toBeInTheDocument();
  });
};

describe('CampaignSettingsPage public orders section', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the share link, capacity notice, and controls once settings load', async () => {
    renderPage(baseMocks());
    await settingsVisible();

    expect(screen.getByText(/3 out of 500 maximum orders/)).toBeInTheDocument();
    expect(screen.getByText(/I acknowledge that enabling public orders/)).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Visa' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Disable' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Enable' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Rotate Share Token' })).toBeEnabled();
  });

  it('explains the missing share link when public orders were never enabled', async () => {
    renderPage(baseMocks(makeSettings({ shareToken: null })));
    await waitFor(() => {
      expect(screen.getByText('Public Orders')).toBeInTheDocument();
    });
    expect(screen.getByText(/Share link not available/)).toBeInTheDocument();
  });

  it('disables the draft controls while public orders are disabled', async () => {
    renderPage(baseMocks(makeSettings({ enabled: false, shareToken: null })));
    await waitFor(() => {
      expect(screen.getByText('Public Orders')).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByRole('checkbox', { name: 'Visa' })).toBeDisabled();
    });
    expect(screen.getByRole('button', { name: 'Enable' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  });

  it('saves a draft edit of the allowed payment methods', async () => {
    const mocks = [
      ...baseMocks(),
      {
        request: {
          query: UPDATE_CAMPAIGN_PUBLIC_ORDER_SETTINGS,
          variables: {
            input: {
              campaignId: CAMPAIGN_ID,
              enabled: true,
              allowedPaymentMethods: ['Cash', 'Visa'],
              acknowledgementsAccepted: true,
            },
          },
        },
        result: {
          data: {
            updateCampaignPublicOrderSettings: makeSettings({
              allowedPaymentMethods: ['Cash', 'Visa'],
            }),
          },
        },
      },
    ];
    renderPage(mocks);
    await settingsVisible();

    await userEvent.click(screen.getByRole('checkbox', { name: 'Visa' }));
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(screen.getByRole('checkbox', { name: 'Visa' })).toBeChecked();
    });
  });

  it('sends rotateToken when the rotate action is clicked', async () => {
    const mocks = [
      ...baseMocks(),
      {
        request: {
          query: UPDATE_CAMPAIGN_PUBLIC_ORDER_SETTINGS,
          variables: {
            input: {
              campaignId: CAMPAIGN_ID,
              enabled: true,
              allowedPaymentMethods: ['Cash'],
              acknowledgementsAccepted: true,
              rotateToken: true,
            },
          },
        },
        result: {
          data: { updateCampaignPublicOrderSettings: makeSettings({ shareToken: 'tok-2' }) },
        },
      },
    ];
    renderPage(mocks);
    await settingsVisible();

    await userEvent.click(screen.getByRole('button', { name: 'Rotate Share Token' }));

    await waitFor(() => {
      expect(screen.getByText(`/o/${CAMPAIGN_ID}/tok-2`)).toBeInTheDocument();
    });
  });

  it('sends enabled=false when the disable action is clicked', async () => {
    const mocks = [
      ...baseMocks(),
      {
        request: {
          query: UPDATE_CAMPAIGN_PUBLIC_ORDER_SETTINGS,
          variables: {
            input: {
              campaignId: CAMPAIGN_ID,
              enabled: false,
              allowedPaymentMethods: ['Cash'],
            },
          },
        },
        result: {
          data: {
            updateCampaignPublicOrderSettings: makeSettings({ enabled: false, shareToken: null }),
          },
        },
      },
    ];
    renderPage(mocks);
    await settingsVisible();

    await userEvent.click(screen.getByRole('button', { name: 'Disable' }));

    await waitFor(() => {
      expect(screen.getByText(/Share link not available/)).toBeInTheDocument();
    });
  });

  it('sends enabled=true when the enable action is clicked on a disabled campaign', async () => {
    const mocks = [
      ...baseMocks(makeSettings({ enabled: false, shareToken: null, acknowledgedAt: null, ackVersion: null })),
      {
        request: {
          query: UPDATE_CAMPAIGN_PUBLIC_ORDER_SETTINGS,
          variables: {
            input: {
              campaignId: CAMPAIGN_ID,
              enabled: true,
              allowedPaymentMethods: ['Cash'],
              acknowledgementsAccepted: false,
            },
          },
        },
        result: {
          data: { updateCampaignPublicOrderSettings: makeSettings() },
        },
      },
    ];
    renderPage(mocks);
    await waitFor(() => {
      expect(screen.getByText('Public Orders')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole('button', { name: 'Enable' }));

    await waitFor(() => {
      expect(screen.getByText(`/o/${CAMPAIGN_ID}/tok-1`)).toBeInTheDocument();
    });
  });
});
