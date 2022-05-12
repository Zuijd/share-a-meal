const assert = require('assert')
const dbconnection = require('../../database/dbconnection')


let controller = {
    getAllMeals: (req, res, next) => {
        dbconnection.getConnection(function (err, connection) {
            if (err) throw err;

            const getAllMealsSql = `SELECT * FROM meal`

            connection.query(getAllMealsSql, (error, results, fields) => {
                connection.release();

                if (error) throw error;

                res.status(200).json({
                    status: 200,
                    result: results,
                });
            });
        });
    },

    addMeal: (req, res, next) => {
        dbconnection.getConnection(function (err, connection) {
            if (err) throw err;

            const meal = req.body;
            const addMealSql = `INSERT INTO meal (isActive, isVega, isVegan, isToTakeHome, dateTime, maxAmountOfParticipants, price, imageUrl, name, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            const mealToAdd = [meal.isActive, meal.isVega, meal.isVegan, meal.isToTakeHome, meal.dateTime, meal.maxAmountOfParticipants, meal.price, meal.imageUrl, meal.name, meal.description];

            connection.query(addMealSql, mealToAdd, (error, results, fields) => {
                connection.release();

                if (error) throw error;

                mealFullData = {
                    "id": results.insertId,
                    ...meal,
                }

                if (results.affectedRows > 0) {
                    res.status(201).json({
                        status: 201,
                        result: mealFullData,
                    });
                }
            });
        })
    },

    getMealById: (req, res, next) => {
        dbconnection.getConnection(function (err, connection) {
            if (err) throw err;

            const mealId = req.params.mealId;
            if (isNaN(mealId)) {
                next();
            }
            const getMealByIdSql = `SELECT * FROM meal WHERE id = ?`;

            connection.query(getMealByIdSql, mealId, (error, results, fields) => {
                connection.release();

                if (error) throw error;
                res.status(200).json({
                    status: 200,
                    result: results[0],
                });
            });
        })
    },

    updateMeal: (req, res, next) => {
        dbconnection.getConnection(function (err, connection) {
            if (err) throw err;

            const meal = req.body;
            const mealId = req.params.mealId;
            if (isNaN(mealId)) {
                next();
            }
            const getMealToUpdateSql = `SELECT * FROM meal WHERE id = ?`;
            const updateMealSql = `UPDATE meal SET isActive = ?, isVega = ?, isVegan = ?, isToTakeHome = ?, dateTime = ?, maxAmountOfParticipants = ?, price = ?, imageUrl = ?, name = ?, description = ? WHERE id = ?`;

            connection.query(getMealToUpdateSql, mealId, (error, results, fields) => {

                if (error) throw error;

                let newMeal = {
                    ...results[0],
                    ...meal,
                }

                const newMealDataInput = [meal.isActive, meal.isVega, meal.isVegan, meal.isToTakeHome, newMeal.dateTime, newMeal.maxAmountOfParticipants, newMeal.price, newMeal.imageUrl, newMeal.name, newMeal.description, mealId];

                connection.query(updateMealSql, newMealDataInput, (error, results, fields) => {
                    connection.release();

                    if (error) throw error;

                    res.status(200).json({
                        status: 200,
                        result: newMeal,
                    });
                });
            });
        });
    },

    deleteMeal: (req, res, next) => {
        dbconnection.getConnection(function (err, connection) {
            if (err) throw err;

            const mealId = req.params.mealId;
            const deleteMealQuery = `DELETE FROM meal WHERE id = ?`;

            connection.query(deleteMealQuery, mealId, (error, results, fields) => {
                connection.release();

                if (error) throw error;

                res.status(200).json({
                    status: 200,
                    message: "Meal succesfully deleted",
                });
            });

        });
    }
}

module.exports = controller