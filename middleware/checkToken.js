import { getUser } from '../database/userDatabase.js';
import { checkValidTokenByToken } from '../database/validationDatabase.js';

import jsonwebtoken from 'jsonwebtoken';

import dotenv from 'dotenv';

dotenv.config();

export const checkToken = async (req, res, next) => {
    console.log("Inside check token");
    const authorization = req.header('Authorization');
    console.log("token", authorization);
    if (!authorization) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    const token = authorization.split(' ')[1];
    try {
        const userid = jsonwebtoken.verify(token, process.env.SECRET);
        const validToken = await checkValidTokenByToken(token);
        if (!validToken) {
            return res.status(401).json({ message: 'Token is revoked' });
        }

        const user = await getUser(userid);
        if (!user) {
            return res.status(401).json({ message: "Can't find user in database" });
        }
        req.userid = userid;
        req.user = user;
        req.token = token;
        next();

    } catch (error) {
        console.log("Error in checktoken: ", error);
        return res.status(400).json({ message: 'Invalid token' });
    }
}
