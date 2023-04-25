import express from 'express';
import {
    addNumberOfParticipantsToActivity, addUserToActivityParticipants, removeNumberOfParticipantsToActivity, removeUserFromActivityParticipants,
    getActivityParticipants, getActivitiesByParticipants
} from '../database/participantsDatabase.js';
import { checkToken } from '../middleware/checkToken.js';
import { checkInput } from '../middleware/checkInput.js';


const participantRoutes = express.Router();

//Assign on participant to activity
participantRoutes.put('/addParticipantToActivity/:id', checkToken, async (req, res) => {
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

participantRoutes.put('/removeParticipantFromActivity/:id', checkToken, async (req, res) => {
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

participantRoutes.get('/getActivityParticipants/:id', checkInput, async (req, res) => {
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

participantRoutes.get('/activities-by-participants/:userid', checkInput, async (req, res) => {
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

export default participantRoutes;