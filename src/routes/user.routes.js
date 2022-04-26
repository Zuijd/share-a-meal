const express = require('express')
const router = express.Router()


let database = [];
let id = 0;


//register as a new user
router.post("/api/user", (req, res) => {
    let movie = req.body;
    let email = req.body.emailAdress;
    let emailcheck = true;

    for (let i = 0; i < database.length; i++) {
        if (database[i].emailAdress == email) {
            emailcheck = false;
        }
    }

    if (emailcheck) {
        id++;
        movie = {
            id,
            ...movie,
        };
        database.push(movie);
        res.status(201).json({
            status: 201,
            result: movie,
        });
    } else {
        res.status(401).json({
            status: 401,
            message: "This email is already linked to a different account!",
        })
    }
});

//get all users
router.get("/api/user", (req, res) => {
    res.status(200).json({
        status: 200,
        result: database,
    });
});

//request your personal user profile
router.get("/api/user/profile", (req, res) => {
    res.status(401).json({
        status: 401,
        message: "This functionality has not been realised (yet)!",
    });
})

//get a single user by id
router.get("/api/user/:userId", (req, res, next) => {
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
            message: `User with ID ${userId} not found`,
        });
    }
});

//update a single user
router.put("/api/user/:userId", (req, res, next) => {
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
            message: `User with ID ${userId} not found`,
        });
    }
});

//delete a user
router.delete("/api/user/:userId", (req, res, next) => {
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




module.exports = router