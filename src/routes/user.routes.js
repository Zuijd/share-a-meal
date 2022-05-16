const express = require('express')
const userRouter = express.Router()
const userController = require('../controllers/user.controller')
const authController = require('../controllers/auth.controller')

//get all users
userRouter.get("/api/user",
    userController.getAllUsers
);

//register as a new user
userRouter.post("/api/user",
    userController.validateUser,
    userController.validateEmail,
    userController.addUser
);

//request your personal user profile
userRouter.get("/api/user/profile",
    authController.validateToken,
    userController.getUserProfile
);

//get a single user by id
userRouter.get("/api/user/:userId",
    userController.getUserByid
);

//update a single user
userRouter.put("/api/user/:userId",
    userController.checkMail,
    userController.updateUser
);

//delete a user
userRouter.delete("/api/user/:userId",
    userController.deleteUser
);




module.exports = userRouter