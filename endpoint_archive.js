/*app.get('/users', async (req, res) => {
    const users = await get_all_users()
    res.send(users);
});

app.post('/user2', async (req, res) => {
    const { name } = req.body;
    const user = await createUserGAMMEL(name);
    res.send(user);
});

//lage ny aktivitet
app.post('/create-activity-old', async (req, res) => {
    try {
        const activity = req.body;
        const id = await createActivity(activity);
        res.status(201).send({ id });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

//Update user
app.put('/user/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { first_name, email } = req.body;
        const user = await updateUser(id, first_name, email);
        res.send(user);
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: 'Error updating user' });
    }
});

//Creating activity
app.post('/activity', async (req, res) => {
    const activity = req.body;
    const id = await createActivity(activity);
    res.send({ id });
});


//Update activity
app.put('/activity-gammel/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { time, county, address, category, description, number_of_participants, created_by } = req.body;
        const activity = await updateActivity(id, time, county, address, category, description, number_of_participants, created_by);
        res.send(activity);
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: 'Error updating activity' });
    }
});

//Get all activity
app.get('/activity-gammel', async (req, res) => {
    const activities = await getAllActivity()
    res.send(activities);
});

//Get user - er denne i bruk???????????????
app.get('/user/:id', async (req, res) => {
    const id = req.params.id
    const user = await getUser(id);
    res.send(user);
});

//Creating user - er denne i bruk ?????????
app.post('/user', async (req, res) => {
    try {
        const { id, first_name, email } = req.body;
        const user = await createUser(id, first_name, email);
        res.send(user);
    }
    catch (error) {
        console.log(error)
        res.status(500).send({ message: 'Error creating user' });
    }
});*/
