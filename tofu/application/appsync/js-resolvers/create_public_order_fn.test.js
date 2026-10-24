import { describe, it } from 'node:test';
import assert from 'node:assert';
import { request, response } from './create_public_order_fn.js';
import { PUBLIC_ORDER_CAP } from './lib/public_order.js';

function makeStash(overrides = {}) {
    return Object.assign(
        {
            campaign: { campaignId: 'CAMPAIGN#c1' },
            catalog: { catalogId: 'CATALOG#cat1', isDeleted: false, products: [{ productId: 'p1', productName: 'P1', price: 10 }] },
            publicOrder: {
                customerName: 'Jane Doe',
                customerFirstName: 'Jane',
                customerLastName: 'Doe',
                paymentMethod: 'Venmo',
                orderDate: '2024-01-01T00:00:00Z',
                lineItems: [{ productId: 'p1', quantity: 1 }],
            },
            profileId: 'PROFILE#p1',
            campaignId: 'CAMPAIGN#c1',
            sellerName: 'My Shop',
        },
        overrides
    );
}

describe('create_public_order request', () => {
    it('refuses a partially-populated stash (wiring fault)', () => {
        assert.throws(() => request({ stash: {} }), /INTERNAL_ERROR: Order could not be written/);
        assert.throws(() => request({ stash: makeStash({ catalog: null }) }), /INTERNAL_ERROR: Order could not be written/);
    });

    it('refuses a soft-deleted catalog', () => {
        assert.throws(
            () => request({ stash: makeStash({ catalog: { isDeleted: true, products: [] } }) }),
            /INVALID_INPUT: Catalog is not available for this campaign/
        );
    });

    it('rejects a line item whose product is not in the catalog', () => {
        const stash = makeStash({ publicOrder: { customerName: 'J D', lineItems: [{ productId: 'missing', quantity: 1 }], paymentMethod: 'Venmo', orderDate: 'd' } });
        assert.throws(() => request({ stash }), /INVALID_INPUT: Product missing not found in catalog/);
    });

    it('uses TransactWriteItems with ConditionCheck on campaign and PutItem on orders', () => {
        const req = request({ stash: makeStash() });
        assert.strictEqual(req.operation, 'TransactWriteItems');
        assert.strictEqual(req.transactItems.length, 2);
        
        // First item: ConditionCheck on Campaigns table
        const conditionCheck = req.transactItems[0];
        assert.strictEqual(conditionCheck.table, 'Campaigns');
        assert.deepStrictEqual(conditionCheck.key, { profileId: 'PROFILE#p1', campaignId: 'CAMPAIGN#c1' });
        assert.strictEqual(conditionCheck.condition.expression, 'attribute_exists(campaignId)');
        
        // Second item: PutItem on Orders table
        const putItem = req.transactItems[1];
        assert.strictEqual(putItem.table, 'Orders');
        const item = putItem.attributeValues;
        assert.strictEqual(item.orderId, 'ORDER#c1#auto-generated-id');
        assert.strictEqual(item.campaignId, 'CAMPAIGN#c1');
        assert.strictEqual(item.orderSource, 'PUBLIC');
        assert.strictEqual(item.status, 'NEW');
        assert.strictEqual(item.sellerName, 'My Shop');
        assert.strictEqual(item.totalAmount, 10);
        assert.strictEqual(item.receiptToken, 'auto-generated-id');
        assert.deepStrictEqual(item.lineItems, [{ productId: 'p1', productName: 'P1', quantity: 1, pricePerUnit: 10, subtotal: 10 }]);
    });

    it('only writes the optional buyer fields that were provided', () => {
        const req = request({ stash: makeStash() });
        const item = req.transactItems[1].attributeValues;
        assert.ok(!('customerEmail' in item));
        assert.ok(!('customerPhone' in item));
        assert.ok(!('notes' in item));
    });
});

describe('create_public_order response', () => {
    it('maps TransactionCanceledException to the limit error (campaign deleted)', () => {
        assert.throws(
            () => response({ error: { type: 'DynamoDB:TransactionCanceledException', message: 'Transaction cancelled' } }),
            /PUBLIC_ORDER_LIMIT_EXCEEDED: This campaign has reached its public order limit/
        );
    });

    it('propagates any other datastore error', () => {
        assert.throws(() => response({ error: { message: 'boom', type: 'DynamoDB:InternalServerError' } }), /DynamoDB:InternalServerError: boom/);
    });

    it('composes the receipt from the written row (second element of TransactWriteItems result)', () => {
        const ctx = {
            result: [
                {}, // ConditionCheck result
                {
                    orderId: 'ORDER#c1#auto-generated-id',
                    receiptToken: 'auto-generated-id',
                    campaignId: 'CAMPAIGN#c1',
                    totalAmount: 0.1,
                }
            ],
        };
        assert.deepStrictEqual(response(ctx), {
            orderId: 'ORDER#c1#auto-generated-id',
            receiptUrl: '/r/c1/auto-generated-id/auto-generated-id',
            totalAmount: 0.1,
            buyerEmailProvided: false,
            confirmationEmailSent: false,
        });
    });

    it('returns INTERNAL_ERROR when result array is missing the order item', () => {
        assert.throws(() => response({ result: [{}] }), /INTERNAL_ERROR: Order could not be written/);
    });
});
