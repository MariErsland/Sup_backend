import { pool } from '../database/database.js';

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