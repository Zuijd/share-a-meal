const express = require('express');
const router = express.Router();
const controller = require('../controllers/meal.controller');
const authController = require('../controllers/auth.controller');

//get all meals
router.get("/api/meal",
    controller.getAllMeals
);

//register meal
router.post("/api/meal",
    controller.checkAddMealinput,
    authController.validateToken,
    controller.addMeal
);

//get a single meal by id
router.get("/api/meal/:mealId",
    controller.getMealById
);

//update a single meal
router.put("/api/meal/:mealId",
    authController.validateToken,
    authController.checkUserRights,
    controller.checkForUpdateData,
    controller.updateMeal
);

//delete meal
router.delete("/api/meal/:mealId",
    authController.validateToken,
    authController.checkUserRights,
    controller.deleteMeal
);

//participate in a meal
router.get("/api/meal/:mealId/participate",
    authController.validateToken,
    controller.participate, 
);




module.exports = router