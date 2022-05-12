const express = require('express')
const router = express.Router()
const controller = require('../controllers/meal.controller')

//get all meals
router.get("/api/meal", controller.getAllMeals);

//register meal
router.post("/api/meal", controller.addMeal);

//get a single meal by id
router.get("/api/meal/:mealId", controller.getMealById);

//update a single meal
router.put("/api/meal/:mealId", controller.updateMeal);

//delete meal
router.delete("/api/meal/:mealId", controller.deleteMeal);

//participate in a meal
router.get("/api/meal/:mealId/participate");




module.exports = router