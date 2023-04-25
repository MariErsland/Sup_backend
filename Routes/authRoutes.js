import express from 'express';
import {
    putTokenInValidTokens, checkValidTokenByUserId, putTokenInRevokedTokens
} from '../database/validationDatabase.js';
import {
    getUser, createUser
} from '../database/userDatabase.js';
import jsonwebtoken from 'jsonwebtoken';
import { checkToken } from '../middleware/checkToken.js';
import { checkInput } from '../middleware/checkInput.js';
import { OAuth2Client } from 'google-auth-library';

const authRoutes = express.Router();
const client = new OAuth2Client(process.env.CLIENT_ID);

//Verify user token, check database for user and make on if not found. and sending back new token
authRoutes.post('/verify-token', async (req, res) => {
    const token = req.headers.authorization.split('Bearer ')[1];
    if (!req.headers.authorization) {
        res.status(401).json({ message: 'Unauthorized' });
    }
    const { first_name, email } = req.body;
    if ((!first_name) || (!email)) {
        res.status(401).json({ message: "Can't find name and/or email in user object" });
    }
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.CLIENT_ID,
        });
        const payload = ticket.getPayload();
        let userid = payload['sub'];
        let user = await getUser(userid);
        if (!user) {
            const userid_string = userid.toString();
            user = await createUser(userid_string, first_name, email);
        }
        let userToken = await checkValidTokenByUserId(userid);
        if (userToken == false) {
            try {
                userToken = jsonwebtoken.sign(userid, process.env.SECRET);
                await putTokenInValidTokens(userid, userToken);
                res.status(200).json({ token: userToken });
            }
            catch (err) {
                console.log("err", err);
            }
        }
        let token_from_database = userToken[0];
        res.status(200).json({ token: token_from_database.token });
    }
    catch (error) {
        console.log(error);
        res.status(401).json({ message: 'Google could not validate token' });
    }
});

authRoutes.post('/log-out', checkToken, async (req, res) => {
    console.log("in log out");
    try {
        await putTokenInRevokedTokens(req.userid, req.token);
        res.status(200).json({ message: 'token revoked' });
    }
    catch (err) {
        res.status(401).json({ message: 'Could not log out user' });
    }
});

export default authRoutes;