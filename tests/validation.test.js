import { pool } from '../database/database.js';
import { checkValidTokenByToken, checkValidTokenByUserId } from '../database/validationDatabase.js';

jest.mock('../database/database.js', () => ({
  pool: {
    query: jest.fn(),
  },
}));

describe('TokenDatabase', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test for checkValidTokenByToken
  describe('checkValidTokenByToken', () => {
    it('Should return true if token is valid', async () => {
      // Arrange
      const TestToken = 'test_token';
      pool.query.mockResolvedValueOnce([[{ token: TestToken }]]);

      // Act
      const isValid = await checkValidTokenByToken(TestToken);

      // Assert
      expect(isValid).toBe(true);
    });
  });

  // Test for checkValidTokenByUserId
  describe('checkValidTokenByUserId', () => {
    it('Should return token if user hasvalid token', async () => {
      // Arrange
      const TestUserId = 1;
      const TestToken = 'test_token';
      pool.query.mockResolvedValueOnce([[{ user_id: TestUserId, token: TestToken }]]);

      // Act
      const token = await checkValidTokenByUserId(TestUserId);

      // Assert
      expect(token).toEqual([{ user_id: TestUserId, token: TestToken }]);
    });
  });

  
});
