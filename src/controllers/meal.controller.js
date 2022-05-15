const assert = require('assert')
const dbconnection = require('../../database/dbconnection')
const jwt = require('jsonwebtoken');


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
            if (err) next(err);

            const meal = req.body;
            const allergenes = req.body.allergenes
            let allergenesArray = [];
            let allergenesString = "";

            allergenes.forEach(element => {
                if (element === "gluten" || element === "noten" || element == "lactose") {
                    if (!(allergenesArray.includes(element))) {
                        allergenesArray.push(element);
                        allergenesString += element + ",";
                    }
                }
            });
            allergenesString = allergenesString.slice(0, -1);

            const authHeader = req.headers.authorization
            const token = authHeader.substring(7, authHeader.length);
            let cookId;

            jwt.verify(token, process.env.JWT_SECRET, function (err, decoded) {
                cookId = decoded.userId;
            });

            const addMealSql = `INSERT INTO meal (isActive, isVega, isVegan, isToTakeHome, dateTime, maxAmountOfParticipants, price, imageUrl, name, description, allergenes, cookId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            const mealToAdd = [meal.isActive, meal.isVega, meal.isVegan, meal.isToTakeHome, meal.dateTime, meal.maxAmountOfParticipants, meal.price, meal.imageUrl, meal.name, meal.description, allergenesString, cookId];



            connection.query(addMealSql, mealToAdd, (error, results, fields) => {
                connection.release();
                if (error) next(error);

                const mealId = results.insertId;

                const userInfoQuery = `SELECT * FROM user WHERE id = ?`

                connection.query(userInfoQuery, cookId, (error, results, fields) => {
                    connection.release();
                    if (error) next(error);

                    const cookInfo = results[0];


                    const addParticpantQuery = `INSERT INTO meal_participants_user (mealId, userId) VALUES (?, ?)`;

                    connection.query(addParticpantQuery, [mealId, cookId], (error, results, fields) => {
                        connection.release();
                        if (error) next(error);

                        const getParticipantsQuery = `SELECT * FROM meal_participants_user WHERE mealId = ?`;

                        connection.query(getParticipantsQuery, mealId, (error, results, fields) => {
                            connection.release();
                            if (error) next(error);

                            let participantIds = [];

                            results.forEach(element => {
                                var i = 0;
                                participantIds.push(results[i].userId);
                                i++;
                            });

                            let participants = [];
                            participantIds.forEach(element => {
                                connection.query(userInfoQuery, element, (error, results, fields) => {
                                    connection.release();
                                    if (error) next(error);
                                    participants.push(results[0]);

                                    mealFullData = {
                                        "id": mealId,
                                        ...meal,
                                        "cook": cookInfo,
                                        "participants": participants

                                    }

                                    res.status(201).json({
                                        status: 201,
                                        result: mealFullData,
                                    });
                                })
                            });
                        });
                    });
                });
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