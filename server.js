import express from 'express';
import {
	putTokenInValidTokens, checkValidTokenByToken, checkValidTokenByUserId, getUser, createUser, updateUser,
	createActivity, getActivity, getAllActivity, updateActivity, getAllActivitiesByUser, putTokenInRevokedTokens,
	addNumberOfParticipantsToActivity, addUserToActivityParticipants, removeNumberOfParticipantsToActivity, removeUserFromActivityParticipants,
	getActivityParticipants, deleteActivity, getActivitiesByParticipants, createComment, getCommentsByActivityId,
	getParticipantsInQueue, putParticipantInQueue, removeParticipantFromQueue, deleteCommentById
} from '../node_sup/database.js';
import dotenv from 'dotenv';
import jsonwebtoken from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import https from 'https';
import http from 'http';
import fs from 'fs';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';

const __dirname = path.resolve();


const port = 443;
const app = express();
const httpServer = http.createServer(app);
const httpPort = 3000;
app.use(express.json());
app.use(cors({
	origin: ['https://supapp.info', 'http://152.94.160.72'],
	methods: ['GET', 'POST', 'PUT', 'DELETE']
}));

const options = {
	key: fs.readFileSync('/etc/letsencrypt/live/supapp.info/privkey.pem'),
	cert: fs.readFileSync('/etc/letsencrypt/live/supapp.info/fullchain.pem')
};

try {
	https.createServer(options, app).listen(port, () => {
		console.log(`HTTPS server is running on port ${port}`);
	});
} catch (err) {
	console.error(err.stack)
	res.status(500).send('Something broke! The server could not start.')
}

try {
	httpServer.listen(httpPort, () => {
		console.log(`HTTP server is running on port ${httpPort}`);
	});
}
catch (err) {
	console.log("Http not running")
}

const client = new OAuth2Client(process.env.CLIENT_ID);

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });

morgan.token('body', (req) => JSON.stringify(req.body));

morgan.token('body', (req) => JSON.stringify(req.body));
app.use(morgan(':method :url :status :response-time ms - :res[content-length] :body - :remote-addr - :referrer', { stream: accessLogStream }));

dotenv.config();