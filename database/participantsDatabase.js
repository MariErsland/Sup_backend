import { pool } from '../database/database.js';


export async function addNumberOfParticipantsToActivity(id) {
    const result = await pool.query(`UPDATE activity SET number_of_participants = number_of_participants + 1 WHERE id = ?`, [id]);
    console.log("activity id:", id);

    const updatedActivity = await pool.query('SELECT * FROM activity WHERE id = ?', [id]);
    return updatedActivity[0];
}

export async function addUserToActivityParticipants(activityid, userid) {
    console.log("Inside add user to activity participants");
    try {
        console.log("Activit id: ", activityid);
        console.log("User id: ", userid);
        const result = await pool.query(`INSERT INTO activity_participants (activity_id, user_id) VALUES (?,?)`,
            [activityid, userid]);
        console.log("Result after addin user to activity participants: ", result);

        const updatedActivity = await pool.query('SELECT * FROM activity_participants WHERE activity_id = ? and user_id = ?', [activityid, userid]);
        console.log("Updated activity: ", updatedActivity[0]);
        return updatedActivity[0];
    }
    catch (err) {
        console.log(err);
    }
}

export async function removeNumberOfParticipantsToActivity(id) {
    const result = await pool.query(`UPDATE activity SET number_of_participants = number_of_participants - 1 WHERE id = ?`, [id]);
    console.log("activity id:", id);

    const updatedActivity = await pool.query('SELECT * FROM activity WHERE id = ?', [id]);
    const allActivityParticipants = await pool.query('SELECT * FROM activity_participants');
    console.log("Updated activity: ", updatedActivity[0]);
    console.log("All activity participants: ", allActivityParticipants[0]);
    return updatedActivity[0];
}

export async function removeUserFromActivityParticipants(activityid, userid) {
    const result = await pool.query(
        `DELETE FROM activity_participants WHERE activity_id = ? AND user_id = ?`,
        [activityid, userid]
    );

    if (result[0].affectedRows === 0) {
        throw new Error(`No matching activityid = ${activityid} and userid = ${userid} found in activity_participants table`);
    }

    console.log("Result after removing user from activity participants: ", result);
    const updatedActivity = await pool.query('SELECT * FROM activity_participants');
    console.log("Updated activity: ", updatedActivity[0]);
    return updatedActivity[0];
}

export async function getActivityParticipants(activityid) {
    console.log("Inside get all activity participants");
    const [result2] = await pool.query('SELECT * FROM activity_participants');
    console.log("All Activity Participants: ", result2)
    const [result] = await pool.query('SELECT * FROM activity_participants WHERE activity_id = ?', [activityid]);

    console.log("Result from gettting activityParticipants: ", result);
    return result;
}

export async function getActivitiesByParticipants(userId) {
    console.log(`Getting activities for user with ID: ${userId}`);

    const query = `
      SELECT activity.*
      FROM activity
      JOIN activity_participants ON activity.id = activity_participants.activity_id
      WHERE activity_participants.user_id = ?
    `;


    try {
        const [rows] = await pool.query(query, [userId]);
        console.log(`Found ${rows.length} activities`);
        return rows;
    } catch (error) {
        console.error(`Error getting activities: ${error.message}`);
        throw error;
    }
}