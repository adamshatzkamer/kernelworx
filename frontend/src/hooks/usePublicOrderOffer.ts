/**
 * Loading the offer behind a public order share link.
 *
 * This query opts into `no-cache` (the public client default is cache-first,
 * so that the immutable receipt read can be cached): the pre-signed QR URLs
 * inside the offer expire after 15 minutes, and a stale offer would hand the
 * buyer images that 403.
 */

import { useQuery } from '@apollo/client/react';
import { PUBLIC_GET_ORDER_OFFER } from '../lib/publicOrderGraphQL';
import type { PublicOfferView } from '../components/public/publicOrderTypes';
import type { GqlPublicGetOrderOfferQuery, GqlPublicGetOrderOfferQueryVariables } from '../types/graphql-generated';

export function usePublicOrderOffer(campaignId: string, token: string) {
  const { data, loading, error, refetch } = useQuery<GqlPublicGetOrderOfferQuery, GqlPublicGetOrderOfferQueryVariables>(
    PUBLIC_GET_ORDER_OFFER,
    { variables: { campaignId, token }, skip: !campaignId || !token, fetchPolicy: 'no-cache' },
  );

  return { offer: (data?.publicGetOrderOffer ?? null) as PublicOfferView | null, loading, error, refetch };
}
