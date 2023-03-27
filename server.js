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

const checkToken = async (req, res, next) => {
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

const checkInput = async (req, res, next) => {
	console.log("Inside check input");
	const DISALLOWED_CHARS = ['!', '#', '$', "'", '"', '>', '<', ';', '-', '+', '=', '$', '€', '%', '&', '(', ')', '[', ']', '{', '}', '/', '\\'];

	// Check if request body exists and is an object
	if (typeof req.body !== 'object') {
		return next(new Error('Request body must be an object'));
	}

	// Loop through each property in the request body
	for (const prop in req.body) {
		if (typeof req.body[prop] !== 'string') {
			// Skip if property value is not a string
			continue;
		}
		if ((prop === "time") || (prop === "category") || (prop === "county")) {
			//Skip since this is not user input
			continue;
		}
		// Check for disallowed characters in property value
		if (DISALLOWED_CHARS.some((char) => req.body[prop].includes(char))) {
			return next(new Error(`Input must not contain the following characters: ${DISALLOWED_CHARS.join(', ')}`));
		}
	}
	next();
}


//Get user by token
app.get('/userByToken', checkToken, async (req, res) => {
	console.log("UserbyToken");
	res.status(200).json({ user: req.user });
});

app.get('/test', async (req, res) => {
	console.log("----------------------------TestTestTest----------------------------");
	res.status(200).send({ message: "Hallo" });
});

app.delete('/activity/:id', checkToken, async (req, res) => {
	try {
		const result = await deleteActivity(req.params.id);
		res.send(result);
	} catch (error) {
		console.log('Error deleting activity:', error);
		res.status(500).send({ message: error });
	}
});


//Update user 
app.put('/user', checkToken, checkInput, async (req, res) => {
	try {
		const { first_name, email } = req.body;
		const user = await updateUser(req.userid, first_name, email);
		res.send(user);
	} catch (error) {
		console.log(error);
		res.status(500).send({ message: 'Error updating user' });
	}
});

//Get activity
app.get('/activity/:id', checkToken, async (req, res) => {
	const id = req.params.id
	const activity = await getActivity(id)
	res.send(activity);
});

//get all activities
app.get('/activities', async (req, res) => {
	console.log("Inside get all activities");
	try {
		const activities = await getAllActivity();
		//går gjennom alle aktiviteter og legger til first_name på user som har laget den
		for (let i = 0; i < activities.length; i++) {
			const activity = activities[i];
			const user = await getUser(activity.created_by);
			activity.created_by = {
				user_id: user.id,
				first_name: user.first_name,
			};
		}
		console.log(activities);
		res.send(activities);
	} catch (error) {
		console.log("Error in getting activities");
		res.status(500).send({ error: error.message });
	}
});

//Get all activities with userid
app.get('/activities-by-user', checkToken, async (req, res) => {
	try {
		const activities = await getAllActivitiesByUser(req.userid);
		for (let i = 0; i < activities.length; i++) {
			const activity = activities[i];
			const user = await getUser(activity.created_by);
			activity.created_by = {
				user_id: user.id,
				first_name: user.first_name,
			};
		}
		res.send(activities);
		console.log("alle aktiviteter inne i activitiesbyuser:" + activities);
	}
	catch (error) {
		console.log("Error in getting activities")
		res.status(500).send({ error: error.message });
	}
});

//lage ny aktivitet 
app.post('/create-activity', checkToken, checkInput, async (req, res) => {
	try {
		const activity = req.body;
		activity.created_by = req.userid;
		const id = await createActivity(activity);
		res.status(201).send({ id });
	} catch (error) {
		console.log("Error in creating activity")
		res.status(500).send({ error: error.message });
	}
});

//Update activity
app.put('/activity/:id', checkToken, checkInput, async (req, res) => {
	try {
		const { id } = req.params;
		const { time, county, address, category, description, title, max_participants } = req.body;
		const activity = await updateActivity(id, time, county, address, category, description, title, max_participants);
		res.send(activity);
	} catch (error) {
		console.log(error);
		res.status(500).send({ message: 'Error updating activity' });
	}
});

//Assign on participant to activity
app.put('/addParticipantToActivity/:id', checkToken, checkInput, async (req, res) => {
	try {
		const { id } = req.params;
		const activity = await addNumberOfParticipantsToActivity(id);
		const activity2 = await addUserToActivityParticipants(id, req.userid)
		res.status(200).send(activity);
	} catch (err) {
		console.log("Error in adding participants: ", err)
		res.status(500).send({ message: 'Error updating activity' });
	}
});

app.put('/removeParticipantFromActivity/:id', checkToken, checkInput, async (req, res) => {
	try {
		const { id } = req.params;
		const activity2 = await removeUserFromActivityParticipants(id, req.userid)
		const activity = await removeNumberOfParticipantsToActivity(id);
		res.status(200).send(activity);
	} catch (err) {
		console.log("Error in removing participants: ", err)
		res.status(500).send({ message: 'Error updating activity' });
	}
});

app.get('/getActivityParticipants/:id', async (req, res) => {
	console.log("Inside getActivityParticipants");
	try {
		const { id } = req.params;
		const activity = await getActivityParticipants(id);
		res.status(200).send(activity);
	} catch (err) {
		console.log("Error in getting activity participants: ", err)
		res.status(500).send({ message: 'Error updating activity' });
	}
});

app.get('/activities-by-participants/:userid', async (req, res) => {
	console.log("er inni activities by participants user id");
	try {
		console.log("userid:", req.params.userid); // value of userid
		const activities = await getActivitiesByParticipants(req.params.userid);
		res.send(activities);
	} catch (error) {
		console.log("Error in getting activities")
		res.status(500).send({ error: error.message });
	}
});



//delete activity
app.delete('/activity/:id', checkToken, checkInput, async (req, res) => {
	console.log("er inni delete act");
	try {
		const { id } = req.params;
		const { created_by } = req.body;
		const result = await pool.query('DELETE FROM activity WHERE id = ? AND created_by = ?', [id, created_by]);
		if (result.affectedRows === 0) {
			throw new Error('Failed to delete activity');
		}
		res.send({ message: 'Activity deleted successfully' });
	} catch (error) {
		console.error(error);
		res.status(500).send({ message: 'Error deleting activity' });
	}
});


//////-------------------------///// WIP ISSI CHAT

// Hente kommentarer for en aktivitet
app.get('/activity/:id/comments', async (req, res) => {
	try {
		const { id } = req.params;
		const comments = await getCommentsByActivityId(id);
		res.status(200).send(comments);
	} catch (error) {
		console.error(error);
		res.status(500).send({ error: error.message });
	}
});

// Legge til en kommentar for en aktivitet
app.post('/activity/:id/comments', async (req, res) => {
	console.log("inne i legge til en kommentar fra en aktivitet");
	try {

		const { id } = req.params;
		const { userId, userFirstName, comment } = req.body;
		console.log("userid inni post:", userId)
		const newComment = await createComment(id, userId, userFirstName, comment);
		res.status(201).send(newComment);
	} catch (error) {
		console.error("error inne i legge til kommentar for en aktivitet", error);
		res.status(500).send({ error: error.message });
	}
});


//slette kommentar
app.delete('/activity/:id/comments', async (req, res) => {
	try {
		const { id } = req.params;
		await deleteCommentById(id);
		res.status(204).send();

	} catch (error) {
		console.error(error);
		res.status(500).send({ error: error.message });
	}
});


app.get('/getParticipantsInQueue/:id', async (req, res) => {
	console.log("Inni get activity participants in queue");
	try {
		const { id } = req.params;
		const participantsInQueue = await getParticipantsInQueue(id);

		res.status(201).send(participantsInQueue);
	} catch (error) {
		console.error("error inne i hente participants in queue", error);
		res.status(500).send({ error: error.message });
	}
});

app.put('/putInQueue/:id', checkToken, async (req, res) => {
	console.log("Inni put participants in queue");
	try {
		const activityid = req.params.id;
		const userId = req.userid;
		await putParticipantInQueue(activityid, userId);
		const participantsInQueue = await getParticipantsInQueue(activityid);

		res.status(201).send({ message: "Success! Added to queue, here is the queue: ", participantsInQueue });
	} catch (error) {
		console.error("error inne i hente participants in queue", error);
		res.status(500).send({ error: error.message });
	}
});

app.delete('/removeFromQueue/:id', checkToken, async (req, res) => {
	console.log("Inni remove participants in queue");
	try {
		const activityid = req.params.id;
		const userId = req.userid.toString();
		await removeParticipantFromQueue(activityid, userId);
		const participantsInQueue = await getParticipantsInQueue(activityid);

		res.status(201).send({ message: "Success! Removed from queue. Here is the queue: ", participantsInQueue });
	} catch (error) {
		console.error("error inne i remove participants in queue", error);
		res.status(500).send({ error: error.message });
	}
});

app.post('/addUserFromQueueToActivityParticipants/:id', async (req, res) => {
	console.log("Inni add user from queue to activity participants")
	try {
		const activityid = req.params.id;
		const userId = req.body.user_id;

		await removeParticipantFromQueue(activityid, userId);
		const participantsInQueue = await getParticipantsInQueue(activityid);
		await addUserToActivityParticipants(activityid, userId);

		res.status(201).send(participantsInQueue);
	} catch (error) {
		console.error("error inne i remove participants in queue", error);

		res.status(500).send({ error: error.message });
	}
});

//Verify user token, check database for user and make on if not found. and sending back new token
app.post('/verify-token', async (req, res) => {
	console.log("in verify token");
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
		console.log("user", userToken);
		if (userToken == false) {
			try {
				userToken = jsonwebtoken.sign(userid, process.env.SECRET);
				console.log("usertoken: ", userToken)
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

app.post('/log-out', checkToken, async (req, res) => {
	console.log("in log out");
	try {
		await putTokenInRevokedTokens(req.userid, req.token);
		res.status(200).json({ message: 'token revoked' });
	}
	catch (err) {
		res.status(401).json({ message: 'Could not log out user' });
	}
});


