const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

const bodyParser = require("body-parser");
app.use(bodyParser.json());

let database = [];
let id = 0;

app.all("*", (req, res, next) => {
    const method = req.method;
    console.log(`Method ${method} is aangeroepen`);
    next();
});

//register as a new user
app.post("/api/user", (req, res) => {
    let movie = req.body;
    id++;
    movie = {
        id,
        ...movie,
    };
    database.push(movie);
    res.status(201).json({
        status: 201,
        result: database,
    });
});

//get all users
app.get("/api/user", (req, res) => {
    res.status(200).json({
        status: 200,
        result: database,
    });
});

//request your personal user profile
app.get("/api/user/profile", (req, res) => {
    res.status(401).json({
        status: 401,
        result: "End-point not found",
    });
})

//get a single user by id
app.get("/api/user/:userId", (req, res, next) => {
    const userId = req.params.userId;
    if (isNaN(userId)) {
        next();
    }
    let user = database.filter((item) => item.id == userId);
    if (user.length > 0) {
        res.status(200).json({
            status: 200,
            result: user,
        });
    } else {
        res.status(401).json({
            status: 401,
            result: `User with ID ${userId} not found`,
        });
    }
});

//update a single user
app.put("/api/user/:userId", (req, res, next) => {
    const userId = req.params.userId;
    let user = req.body;
    if (isNaN(userId)) {
        next();
    }

    let userToPut = null;

    for (let i = 0; i < database.length; i++) {
        if (database[i].id == userId) {
            userToPut = i;
            break;
        }
    }

    if (userToPut != null) {

        id = parseInt(userId);
        user = {
            id,
            ...user,
        };

        database.splice(userToPut, 1, user);
        res.status(201).json({
            status: 201,
            result: user,
        });
    } else {
        res.status(401).json({
            status: 401,
            result: `User with ID ${userId} not found`,
        });
    }
});

//delete a user
app.delete("/api/user/:userId", (req, res, next) => {
    const userId = req.params.userId;
    if (isNaN(userId)) {
        next();
    }

    let userToDelete = null;

    for (let i = 0; i < database.length; i++) {
        if (database[i].id == userId) {
            userToDelete = i;
            break;
        }
    }

    if (userToDelete != null) {
        database.splice(userToDelete, 1);
        res.status(200).json({
            status: 200,
            message: `User with ID ${userId} deleted`,
        });
    } else {
        res.status(401).json({
            status: 401,
            message: `User with ID ${userId} not found`,
        });
    }
});

app.all("*", (req, res) => {
    res.status(401).json({
        status: 401,
        result: "End-point not found",
    });
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});