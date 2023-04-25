import { pool } from '../database/database.js';

jest.mock('../database/database.js', () => ({
    pool: {
      query: jest.fn(),
    },
  }));

// Importerer funksjonene som skal testes
import { getUser, createUser, deleteUser, updateUser } from '../database/userDatabase.js';

describe('UserDatabase', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test for getUser
  describe('getUser', () => {
    it('Should return user with ID = 1', async () => {
      // Arrange
      const TestUser = { id: 1, first_name: 'Mari', email: 'mari@test.com' };
      pool.query.mockResolvedValueOnce([[TestUser]]);

      // Act
      const getUserResult = await getUser(1);
      
      // Assert
      console.log('testuser: ' + TestUser);
      console.log('getUserResult: ' + getUserResult)
      expect(getUserResult).toEqual(TestUser);
    });
  });

  // Test for createUser
  describe('createUser', () => {
    it('Should insert new user', async () => {
      // Arrange
      const TestUser = { id: 2, first_name: 'Mari', email: 'mari@test.com' };
      pool.query.mockResolvedValueOnce(TestUser);

      // Act
      const createdUser = await createUser(1, 'Mari', 'Mari@test.com');

      // Assert
      expect(createdUser).toEqual(TestUser);
    });

});

describe('DeleteUser', () => {
    it('Should delte user', async () => {
        // Arrange
        const TestUser = { id: 1, first_name: 'Mari', email: 'mari@test.com' };
        pool.query.mockResolvedValueOnce(TestUser)
        pool.query.mockResolvedValueOnce( { affectedRows: 1});

        // Ac
        const result = await deleteUser(1);
        
        //Assert
        expect(result).toEqual({ affectedRows: 1});


    })
})


});
