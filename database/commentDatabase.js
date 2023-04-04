import { pool } from '../database/database.js';


export async function createComment(activityId, userId, userFirstName, comment) {
    const query = 'INSERT INTO comments (activity_id, user_id, user_first_name, comment) VALUES (?, ?, ?, ?)';
    const [result] = await pool.query(query, [activityId, userId, userFirstName, comment]);
    const createdComment = {
        id: result.insertId,
        activity_id: activityId,
        user_id: userId,
        user_first_name: userFirstName,
        comment: comment,
        created_at: new Date().toISOString()
    };
    return createdComment;
}

export async function deleteCommentById(commentId) {
    const query = 'DELETE FROM comments WHERE id = ?';
    await pool.query(query, [commentId]);
}

export async function getCommentsByActivityId(activityId) {
    const query = 'SELECT * FROM comments WHERE activity_id = ?';
    const [rows] = await pool.query(query, [activityId]);
    return rows;
}