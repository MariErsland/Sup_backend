
import express from 'express';
import dotenv from 'dotenv';
import http from 'http';
import path from 'path';
import authRoutes from './Routes/authRoutes.js';
import activityRoutes from './Routes/activityRoutes.js';
import commentRoutes from './Routes/commentRoutes.js';
import participantRoutes from './Routes/participantRoutes.js';
import userRoutes from './Routes/userRoutes.js';
import queueRoutes from './Routes/queueRoutes.js';



const app = express();
const httpServer = http.createServer(app);
const httpPort = 3000;
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/activity', activityRoutes);
app.use('/comment', commentRoutes);
app.use('/participant', participantRoutes);
app.use('/queue', queueRoutes);
app.use('/user', userRoutes);

try {
	httpServer.listen(httpPort, () => {
		console.log(`HTTP server is running on port ${httpPort}`);
	});
}
catch (err) {
	console.log("Http not running")
}

dotenv.config();