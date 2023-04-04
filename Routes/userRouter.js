import express from 'express';
import { updateUser, deleteUser } from '../database/userDatabase.js';
import { checkToken } from '../middleware/checkToken.js';
import { checkInput } from '../middleware/checkInput.js';

const userRoutes = express.Router();

//Get user by token
userRoutes.get('/userByToken', checkToken, async (req, res) => {
    console.log("UserbyToken");
    res.status(200).json({ user: req.user });
});

//Update user 
userRoutes.put('/user', checkToken, checkInput, async (req, res) => {
    try {
        const { first_name, email } = req.body;
        const user = await updateUser(req.userid, first_name, email);
        res.send(user);
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: 'Error updating user' });
    }
});

//Delete user
userRoutes.delete('/delete-account', checkToken, async (req, res) => {
    console.log("Delete user: ", req.userid);
    try {
        const result = await deleteUser(req.userid);
        res.send(result);
    } catch (error) {
        console.log('Error deleting user:', error);
        res.status(500).send({ message: error });
    }
});

export default userRoutes;