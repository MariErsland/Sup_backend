import express from 'express';
import { getParticipantsInQueue, putParticipantInQueue, removeParticipantFromQueue } from '../database/queueDatabase.js';
import { addUserToActivityParticipants } from '../database/participantsDatabase.js';
import { checkToken } from '../middleware/checkToken.js';
import { checkInput } from '../middleware/checkInput.js';

const queueRoutes = express.Router();

queueRoutes.put('/putInQueue/:id', checkToken, async (req, res) => {
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

queueRoutes.delete('/removeFromQueue/:id', checkToken, async (req, res) => {
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

queueRoutes.post('/addUserFromQueueToActivityParticipants/:id', checkToken, async (req, res) => {
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

queueRoutes.get('/getParticipantsInQueue/:id', async (req, res) => {
    console.log("Inni get activity participants in queue");
    try {
        const { id } = req.params;
        const participantsInQueue = await getParticipantsInQueue(id);

        res.status(201).send(participantsInQueue);
    } catch (error) {
        console.error("error inne i hente participants in queue", error);
        res.status(500).send({ error: error.message }); git
    }
});

export default queueRoutes;
