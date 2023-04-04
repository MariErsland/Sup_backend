import express from 'express';
import { createComment, getCommentsByActivityId, deleteCommentById } from '../database/commentDatabase.js';
import { checkToken } from '../middleware/checkToken.js';
import { checkInput } from '../middleware/checkInput.js';


const commentRoutes = express.Router();

commentRoutes.get('/activity/:id/comments', async (req, res) => {
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
commentRoutes.post('/activity/:id/comments', async (req, res) => {
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
commentRoutes.delete('/activity/:id/comments', async (req, res) => {
    try {
        const { id } = req.params;
        await deleteCommentById(id);
        res.status(204).send();

    } catch (error) {
        console.error(error);
        res.status(500).send({ error: error.message });
    }
});

export default commentRoutes;