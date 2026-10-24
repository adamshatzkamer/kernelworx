/**
 * PublicOrderPage order-cap tests (ARCH-7-FE).
 *
 * `remainingOrders` and `isSoldOut` are additive, nullable schema fields: an
 * offer read taken before they exist carries neither. So the page has to read
 * them defensively — only an explicit `isSoldOut: true` or a `remainingOrders`
 * of exactly 0 may close the link, and a missing field must never be read as 0,
 * which would turn every pre-existing offer into a sold-out one.
 *
 * The form hook is stubbed: what is under test here is the page's reading of
 * the cap fields and what it does to the submit button, not the form itself
 * (covered in tests/hooks/usePublicOrderForm.test.ts).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { PublicOrderPage, NO_METHODS_MESSAGE, SOLD_OUT_MESSAGE } from '../src/pages/PublicOrderPage';
import type { PublicOfferView } from '../src/components/public/publicOrderTypes';
import type { usePublicOrderForm } from '../src/hooks/usePublicOrderForm';

const { offerRef, errorRef, formMock } = vi.hoisted(() => ({
  offerRef: { current: null as PublicOfferView | null },
  errorRef: { current: undefined as unknown },
  formMock: vi.fn(),
}));

vi.mock('../src/hooks/usePublicOrderOffer', () => ({
  usePublicOrderOffer: () => ({
    offer: offerRef.current,
    loading: false,
    error: errorRef.current,
    refetch: vi.fn(),
  }),
}));

vi.mock('../src/hooks/usePublicOrderForm', () => ({ usePublicOrderForm: formMock }));

const baseOffer: PublicOfferView = {
  sellerName: 'Acme Troop',
  campaignId: 'CAMPAIGN#c1',
  campaignName: 'Spring Sale',
  products: [{ productId: 'PROD#1', productName: 'Cookie Box', price: 10 }],
  paymentMethods: [{ name: 'Venmo', qrCodeUrl: null }],
};

const stubForm = (overrides: Record<string, unknown> = {}) => {
  formMock.mockReturnValue({
    form: {
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      address: { street: '', city: '', state: '', zipCode: '' },
      lineItems: {},
      paymentMethod: '',
      notes: '',
    },
    errors: {},
    submitting: false,
    noEmailPrompt: false,
    submitError: null,
    receipt: null,
    summary: null,
    totalAmount: 0,
    setField: vi.fn(),
    setAddressField: vi.fn(),
    setQuantity: vi.fn(),
    setNoEmailPrompt: vi.fn(),
    submit: vi.fn(),
    submitNow: vi.fn(),
    ...overrides,
  } as unknown as ReturnType<typeof usePublicOrderForm>);
};

const renderPage = (
  offer: PublicOfferView | null,
  formOverrides: Record<string, unknown> = {},
  offerError: unknown = undefined,
) => {
  offerRef.current = offer;
  errorRef.current = offerError;
  stubForm(formOverrides);
  return render(
    <MemoryRouter initialEntries={['/o/c1/tok-1']}>
      <Routes>
        <Route path="/o/:campaignId/:token" element={<PublicOrderPage />} />
      </Routes>
    </MemoryRouter>,
  );
};

describe('PublicOrderPage order cap', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('leaves the form orderable when the offer carries neither cap field', () => {
    // A read taken before the fields existed must keep working.
    renderPage({ ...baseOffer });
    expect(screen.queryByTestId('sold-out-alert')).toBeNull();
    expect(screen.getByTestId('submit-order')).toBeEnabled();
  });

  it('leaves the form orderable when both cap fields are null', () => {
    renderPage({ ...baseOffer, remainingOrders: null, isSoldOut: null });
    expect(screen.queryByTestId('sold-out-alert')).toBeNull();
    expect(screen.getByTestId('submit-order')).toBeEnabled();
  });

  it('closes the link when isSoldOut is true', () => {
    renderPage({ ...baseOffer, isSoldOut: true });
    expect(screen.getByTestId('sold-out-alert')).toHaveTextContent(SOLD_OUT_MESSAGE);
    expect(screen.getByTestId('submit-order')).toBeDisabled();
  });

  it('closes the link when remainingOrders is exactly zero', () => {
    renderPage({ ...baseOffer, remainingOrders: 0 });
    expect(screen.getByTestId('sold-out-alert')).toBeInTheDocument();
    expect(screen.getByTestId('submit-order')).toBeDisabled();
  });

  it('does not read a missing remainingOrders as zero', () => {
    renderPage({ ...baseOffer, isSoldOut: false });
    expect(screen.queryByTestId('sold-out-alert')).toBeNull();
    expect(screen.getByTestId('submit-order')).toBeEnabled();
  });

  it('shows the remaining count while orders are still available', () => {
    renderPage({ ...baseOffer, remainingOrders: 3, isSoldOut: false });
    expect(screen.getByTestId('remaining-orders')).toHaveTextContent('3 orders still available on this link.');
    expect(screen.queryByTestId('sold-out-alert')).toBeNull();
    expect(screen.getByTestId('submit-order')).toBeEnabled();
  });

  it('words a single remaining order in the singular', () => {
    renderPage({ ...baseOffer, remainingOrders: 1 });
    expect(screen.getByTestId('remaining-orders')).toHaveTextContent('1 order still available on this link.');
  });

  it('shows no remaining-count notice when the seller set no cap', () => {
    renderPage({ ...baseOffer, remainingOrders: null, isSoldOut: false });
    expect(screen.queryByTestId('remaining-orders')).toBeNull();
  });

  it('states the cap reason in its own words rather than the empty-catalog message', () => {
    renderPage({ ...baseOffer, remainingOrders: 0 });
    expect(screen.queryByTestId('no-methods-alert')).toBeNull();
    expect(screen.getByTestId('sold-out-alert')).toBeInTheDocument();
  });
});

describe('PublicOrderPage empty offer lists', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('disables submission and explains an offer with no payment methods', () => {
    renderPage({ ...baseOffer, paymentMethods: [] });
    expect(screen.getByTestId('no-methods-alert')).toHaveTextContent(NO_METHODS_MESSAGE);
    expect(screen.getByTestId('submit-order')).toBeDisabled();
  });

  it('disables submission for an offer with no products', () => {
    renderPage({ ...baseOffer, products: [] });
    expect(screen.getByTestId('no-methods-alert')).toBeInTheDocument();
    expect(screen.getByTestId('submit-order')).toBeDisabled();
  });
});

describe('PublicOrderPage form state passthrough', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders a submission error above the fields', () => {
    renderPage({ ...baseOffer }, { submitError: 'This campaign has reached its public order limit.' });
    expect(screen.getByTestId('submit-error')).toHaveTextContent(
      'This campaign has reached its public order limit.',
    );
  });

  it('shows the success screen instead of the form once an order is placed', () => {
    renderPage({ ...baseOffer }, {
      receipt: {
        orderId: 'ORDER#c1#abc',
        receiptUrl: '/r/c1/abc',
        totalAmount: 10,
        buyerEmailProvided: false,
        confirmationEmailSent: false,
      },
      summary: { firstName: 'Ada', lastName: 'L', paymentMethod: 'Venmo', lineItems: [] },
    });
    expect(screen.getByTestId('public-order-success')).toBeInTheDocument();
    expect(screen.queryByTestId('submit-order')).toBeNull();
  });

  it('keeps the seller and campaign headings visible', () => {
    renderPage({ ...baseOffer });
    expect(screen.getByText('Acme Troop')).toBeInTheDocument();
    expect(screen.getByText('Spring Sale')).toBeInTheDocument();
  });

  it('shows the estimated total the form hook computed', () => {
    renderPage({ ...baseOffer });
    expect(screen.getByTestId('order-total')).toHaveTextContent('Estimated total: $0.00');
  });
});

describe('PublicOrderPage refetch failure', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('keeps the form mounted and warns when a refetch failed but an offer is retained', () => {
    // The buyer's typed form is still there; the refresh is what failed.
    renderPage({ ...baseOffer }, {}, new Error('Network request failed'));
    expect(screen.getByTestId('submit-order')).toBeInTheDocument();
    expect(screen.getByText('Some of this page could not be refreshed.')).toBeInTheDocument();
  });

  it('does not warn when the read succeeded', () => {
    renderPage({ ...baseOffer });
    expect(screen.queryByText('Some of this page could not be refreshed.')).toBeNull();
  });

  it('shows no warning and no form when there is no offer at all', () => {
    renderPage(null, {}, new Error('gone'));
    expect(screen.queryByTestId('submit-order')).toBeNull();
    expect(screen.queryByText('Some of this page could not be refreshed.')).toBeNull();
  });
});
