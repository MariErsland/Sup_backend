import { pool } from '../database/database.js';

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
    const user = getUser(id);
    const result = await pool.query(`DELETE FROM user WHERE id = ?`, [id]);
    console.log("Inside delete user, here is the result : ", result + "and user: " + user)
    return result;
}

export async function updateUser(id, first_name, email) {
    const result = await pool.query(`UPDATE user SET first_name = ?, email = ? WHERE id = ?`, [first_name, email, id]);
    return result;
}

