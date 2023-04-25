import { getActivity, updateActivity, createActivity, deleteActivity } from '../database/activityDatabase.js';
import { pool } from '../database/database.js';

jest.mock('../database/database.js', () => ({
  pool: {
    query: jest.fn(),
  },
}));

const validActivity1 = {
  id: 1,
  title: 'Test Aktivitet hei hei',
  description: 'Tester en aktivitet som skal fungere',
  created_by: 123,
  time: new Date(),
  county: 'Rogaland',
  address: 'Testtesttest 1',
  category: 'Jogging',
  number_of_participants: 1,
  max_participants: 10,
};

const validActivity2 = {
  id: 2,
  title: 'Test Aktivitet nummer 2',
  description: 'En annen testaktivitet',
  created_by: 456,
  time: new Date(),
  county: 'Oslo',
  address: 'Testtesttest 2',
  category: 'Tur',
  number_of_participants: 2,
  max_participants: 10,
};

describe('ActivityDatabase', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  //Test for getActivity
  describe('getActivity', () => {
    it('Should return activity with ID = 1', async () => {
      // Arrange
      pool.query.mockResolvedValueOnce([[validActivity1]]);

      // Act
      const getActivityResult = await getActivity(1);

      // Assert
      expect(getActivityResult).toEqual(validActivity1);
    });
  });


  //Test for createActivity
  describe('createActivity', () => {
    it('Should insert new activity', async () => {

      // Arrange
      pool.query.mockResolvedValueOnce([[{ id: validActivity2.created_by }]]);
      pool.query.mockResolvedValueOnce([[], [{ insertId: 2 }]]);
      pool.query.mockResolvedValueOnce([[{ ...validActivity2, created_by: validActivity2.created_by }]]);

      // Act
      const createdActivity = await createActivity(validActivity2);

      // Assert
      expect(createdActivity).toEqual(validActivity2);
    });
  });

  //Test for deleteActivity
  describe('deleteActivity', () => {
    it('This should delete an existing activity', async () => {
      // Arrange
      pool.query.mockResolvedValueOnce({ affectedRows: 1 });
      pool.query.mockResolvedValueOnce([[validActivity2]]);
  
      // Act
      const result = await deleteActivity(validActivity2.id);
  
      // Assert
      expect(result).toEqual({ affectedRows: 1 });
    });
  });

});