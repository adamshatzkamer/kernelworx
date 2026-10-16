import { buildSharePath } from '../../src/lib/publicOrders';

describe('publicOrders', () => {
  describe('buildSharePath', () => {
    it('returns the correct path', () => {
      expect(buildSharePath('campaign123', 'token456')).toBe('/o/campaign123/token456');
    });
  });
});
