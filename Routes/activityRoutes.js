import express from 'express';
import {
    createActivity, getActivity, getAllActivity, updateActivity, getAllActivitiesByUser, deleteActivity
} from '../database/activityDatabase.js';
import { getUser } from '../database/userDatabase.js';
import { checkToken } from '../middleware/checkToken.js';
import { checkInput } from '../middleware/checkInput.js';

const activityRoutes = express.Router();

//Get activity
activityRoutes.get('/activity/:id', checkToken, async (req, res) => {
    const id = req.params.id
    const activity = await getActivity(id)
    res.send(activity);
});

//Delete activity
activityRoutes.delete('/activity/:id', checkToken, async (req, res) => {
    try {
        const result = await deleteActivity(req.params.id);
        res.send(result)
    } catch (error) {
        console.log('Error deleting activity:', error);
        res.status(500).send({ message: error });
    }
});

//get all activities
activityRoutes.get('/activities', checkToken, async (req, res) => {
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
activityRoutes.get('/activities-by-user', checkToken, async (req, res) => {
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
activityRoutes.post('/create-activity', checkToken, checkInput, async (req, res) => {
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
activityRoutes.put('/activity/:id', checkToken, checkInput, async (req, res) => {
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

//delete activity
activityRoutes.delete('/activity/:id', checkToken, async (req, res) => {
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

export default activityRoutes;