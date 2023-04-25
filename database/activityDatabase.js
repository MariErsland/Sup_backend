import { pool } from '../database/database.js';
import { addNumberOfParticipantsToActivity, addUserToActivityParticipants } from '../database/participantsDatabase.js'

export async function getActivity(id) {
    const [rows] = await pool.query(`SELECT * FROM activity WHERE id = ?`, [id]);
    return rows[0];
}

export async function getAllActivity() {
    const [rows] = await pool.query('SELECT * from activity')
    return rows;
}

export async function getAllActivitiesByUser(userid) {
    console.log("Inside getactivitesbyuser in database.js")
    const [rows] = await pool.query('SELECT * from activity WHERE created_by = ?', [userid])
    console.log(rows);
    return rows;
}

export async function createActivity(activity) {
    console.log('er her');
    try {
        const { time, county, address, category, description, number_of_participants, created_by, title, max_participants } = activity;
        const datetime = new Date(time).toISOString().slice(0, 19).replace('T', ' ');
        //Check if user exist 
        const [userExist] = await pool.query(
            `SELECT * FROM user WHERE id = ?`,
            [created_by]
        );
        if (userExist.length === 0) {
            throw new Error("user does not exist")
        }
        const [result] = await pool.query(
            `INSERT INTO activity (time, county, address, category, description, number_of_participants, created_by, title, max_participants)
            VALUES (?,?, ?, ?, ?, ?, ?, ?, ?)`,
            [time, county, address, category, description, number_of_participants, created_by, title, max_participants]
        );
        const [createdActivity] = await pool.query(
            `SELECT * FROM activity WHERE id = ?`,
            [result.insertId]
        );
        addNumberOfParticipantsToActivity(createdActivity[0].id)
        addUserToActivityParticipants(createdActivity[0].id, created_by)
        return createdActivity[0];
    } catch (error) {
        console.error(error);
        throw new Error(error.message);
    }
}

export async function updateActivity(id, time, county, address, category, description, title, max_participants) {
    console.log('updateActivity called with parameters:', id, time, county, address, category, description, title, max_participants);
    const updatedActivity = await pool.query('UPDATE activity SET time = ?, county = ?, address = ?, category = ?, description = ?, title = ?, max_participants = ? WHERE id = ?', [time, county, address, category, description, title, max_participants, id]);
    console.log(`Activity ${id} updated successfully`);
    return updatedActivity[0];
}



export async function deleteActivity(id) {
    const result = await pool.query('DELETE FROM activity WHERE id = ?', [id]);
    return result;
}