import { pool } from '../database/database.js';
import { createComment, deleteCommentById, getCommentsByActivityId } from '../database/commentDatabase.js';

jest.mock('../database/database.js', () => ({
    pool: {
        query: jest.fn(),
    },
}));

// Test for createCommen
it('should create new comment', async () => {
    // Arrange
    const activityId = 1;
    const userId = 1;
    const userFirstName = 'Mari';
    const comment = 'Hei dette er en kommentar';

    pool.query.mockResolvedValueOnce([{ insertId: 1 }]);
    pool.query.mockResolvedValueOnce([{ id: 1, activity_id: activityId, user_id: userId, user_first_name: userFirstName, comment: comment, created_at: new Date().toISOString() }]);

    // Act 
    const createdComment = await createComment(activityId, userId, userFirstName, comment);

    // Assert
    expect(createdComment.id).toBeDefined();
    expect(createdComment.activity_id).toBe(activityId);
    expect(createdComment.user_id).toBe(userId);
    expect(createdComment.user_first_name).toBe(userFirstName);
    expect(createdComment.comment).toBe(comment);
    expect(createdComment.created_at).toBeDefined();
});
