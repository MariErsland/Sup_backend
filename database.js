import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();


const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
}).promise()

/// Userd

export async function getUser(id) {
    const [rows] = await pool.query(`SELECT * FROM user WHERE id = ?`, [id])
    return rows[0]
}

export async function createUser(id, first_name, email) {
    let result;
    try {
        result = await pool.query(`
    INSERT INTO user (id, first_name, email)
    VALUES (?,?,?)`,
            [id, first_name, email]);
    }
    catch (err) {
        console.log(err);
    }
    return result;
}

export async function deleteUser(id) {
    const result = await pool.query(`DELETE FROM user WHERE id = ?`, [id]);

    return result;
}

export async function updateUser(id, first_name, email) {
    const result = await pool.query(`UPDATE user SET first_name = ?, email = ? WHERE id = ?`, [first_name, email, id]);
    return result;
}


// Token stuff

export async function checkValidTokenByToken(token) {
    console.log("check valid token in database.js");
    const validToken = await pool.query("SELECT * FROM valid_tokens WHERE token = ?", [token]);
    console.log("valid token[0]: ", validToken[0]);
    if (validToken[0].length > 0) {
        return true;
    }
    return false;
}

export async function checkValidTokenByUserId(userid) {
    console.log("check valid token in checkvalidtokenbyuserid in database.js");
    const validToken = await pool.query("SELECT * FROM valid_tokens WHERE user_id = ?", [userid]);
    console.log("valid token[0]: ", validToken[0]);
    if (!validToken) {
        return false;
    }
    return validToken[0];
}

export async function putTokenInValidTokens(userid, token) {
    console.log("put token in valid tokens");
    let result;
    try {
        let result = await pool.query(`
    INSERT INTO valid_tokens (user_id, token)
    VALUES (?,?)`,
            [userid, token]);
    }
    catch (err) {
        console.log(err);
    }
    return result;
}

export async function removeTokenFromValidTokens(token) {
    console.log("Remove token from valid tokens");
    try {
        await pool.query(`DELETE FROM valid_tokens WHERE token = ?`, [token]);
    }
    catch (err) {
        console.log(err)
    }
}

export async function putTokenInRevokedTokens(userid, token) {
    console.log("Put token in revoked tokens");
    let isValid = checkValidTokenByToken(token);
    let result;
    if (isValid) {
        await removeTokenFromValidTokens(token);
    }
    try {
        result = await pool.query(`
    INSERT INTO revoked_tokens (user_id, token)
    VALUES (?,?)`,
            [userid, token]);
    }
    catch (err) {
        console.log("Error in putting token in revoked: ", err);

    }
    return result;
}

//Aktiviteter

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


/*export async function updateActivity(id, time, county, address, category, description, number_of_participants, created_by) {
    const result = await pool.query(`UPDATE activity SET time = ?, county = ?, address = ?, category = ?, description = ?, number_of_participants = ? WHERE id = ? AND created_by = ?`, [time, county, address, category, description, number_of_participants, id, created_by]);
    console.log("activity id:", id);
    console.log("created by:", created_by);
    console.log("number of participants", number_of_participants);

    const updatedActivity = await pool.query('SELECT * FROM activity WHERE id = ?', [id]);
    return updatedActivity[0];
}
*/

export async function updateActivity(id, time, county, address, category, description, title, max_participants) {
    console.log('updateActivity called with parameters:', id, time, county, address, category, description, title, max_participants);
    const updatedActivity = await pool.query('UPDATE activity SET time = ?, county = ?, address = ?, category = ?, description = ?, title = ?, max_participants = ? WHERE id = ?', [time, county, address, category, description, title, max_participants, id]);
    console.log(`Activity ${id} updated successfully`);
    return updatedActivity[0];
}




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


export async function deleteActivity(id) {
    const result = await pool.query('DELETE FROM activity WHERE id = ?', [id]);
    return result;
}

export async function getCommentsByActivityId(activityId) {
    const query = 'SELECT * FROM comments WHERE activity_id = ?';
    const [rows] = await pool.query(query, [activityId]);
    return rows;
}

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


////Gamle

export async function get_all_users() {
    const [rows] = await pool.query('select * from user')
    return rows;
}

export async function createUserGAMMEL(name) {
    const result = await pool.query(`
    INSERT INTO user (email)
    VALUES (?)`,
        [name])
    return result;
}



/*async function main() {
    //const user = await createUser("Marthe");
    //const user = await get_all_users();
    const user = await createUser(4, 'mari2', 'email2');
    //console.log("Get user with id (something)" + user);

    //await createUser("Mari" ,"mari@kul.no");
    //console.log(getUser(2));
}

main();*/

