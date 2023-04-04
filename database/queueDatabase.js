import { pool } from '../database/database.js';

export async function getParticipantsInQueue(id) {
    try {
        const [rows] = await pool.query('SELECT * FROM participants_queue WHERE activity_id = ?', [id])
        console.log("Rows in queue: ", rows);
        return rows;
    }
    catch (err) {
        console.log("Error in gettint queue: ", err)
    }
}

export async function putParticipantInQueue(activityId, userId) {
    try {
        const time = new Date().toISOString().slice(0, 19).replace('T', ' ');
        const [rows] = await pool.query(`INSERT INTO participants_queue (activity_id, user_id, time) VALUES (?,?,?)`,
            [activityId, userId, time]);
        console.log("Rows in queue: ", rows);
        return rows;
    }
    catch (err) {
        console.log("Error in putting in queue: ", err)
    }
}

export async function removeParticipantFromQueue(activityId, userId) {
    try {
        const [result] = await pool.query(
            `DELETE FROM participants_queue WHERE activity_id = ? AND user_id = ?`,
            [activityId, userId]
        );
        console.log("Userid: ", userId)
        console.log("activityid: ", activityId)
        console.log("Rows in queue2: ", result);
        return result;
    }
    catch (err) {
        console.log("Error in putting in queue: ", err)
    }
}