const express = require('express')
const router = express.Router()
const controller = require('../controllers/user.controller')

//get all users
router.get("/api/user", controller.getAllUsers);

//register as a new user
router.post("/api/user", controller.validateUser, controller.addUser);

//request your personal user profile
router.get("/api/user/profile", controller.getUserProfile);

//get a single user by id
router.get("/api/user/:userId", controller.userExists, controller.getUserByid);

//update a single user
router.put("/api/user/:userId", controller.userExists, controller.validateUser, controller.updateUser);

//delete a user
router.delete("/api/user/:userId", controller.deleteUser);




module.exports = router