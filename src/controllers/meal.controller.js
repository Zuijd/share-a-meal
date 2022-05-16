const assert = require('assert')
const dbconnection = require('../../database/dbconnection')
const jwt = require('jsonwebtoken');

//queries
const addMealSql = `INSERT INTO meal (isActive, isVega, isVegan, isToTakeHome, dateTime, maxAmountOfParticipants, price, imageUrl, name, description, allergenes, cookId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
const addParticpantQuery = `INSERT INTO meal_participants_user (mealId, userId) VALUES (?, ?)`;

const userInfoQuery = `SELECT * FROM user WHERE id = ?`
const getAllMealsSql = `SELECT * FROM meal`
const getParticipantsQuery = `SELECT * FROM meal_participants_user WHERE mealId = ?`;
const getMealByIdSql = `SELECT * FROM meal WHERE id = ?`;

const updateMealSql = `UPDATE meal SET isActive = ?, isVega = ?, isVegan = ?, isToTakeHome = ?, dateTime = ?, maxAmountOfParticipants = ?, price = ?, imageUrl = ?, name = ?, description = ? WHERE id = ?`;

const deleteMealQuery = `DELETE FROM meal WHERE id = ?`;


let controller = {
    getAllMeals: (req, res, next) => {
        dbconnection.getConnection(function (err, connection) {
            if (err) throw err;



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


            const mealToAdd = [meal.isActive, meal.isVega, meal.isVegan, meal.isToTakeHome, meal.dateTime, meal.maxAmountOfParticipants, meal.price, meal.imageUrl, meal.name, meal.description, allergenesString, cookId];



            connection.query(addMealSql, mealToAdd, (error, results, fields) => {
                connection.release();
                if (error) next(error);

                const mealId = results.insertId;



                connection.query(userInfoQuery, cookId, (error, results, fields) => {
                    connection.release();
                    if (error) next(error);

                    const cookInfo = results[0];

                    connection.query(addParticpantQuery, [mealId, cookId], (error, results, fields) => {
                        connection.release();
                        if (error) next(error);

                        connection.query(getParticipantsQuery, mealId, (error, results, fields) => {
                            connection.release();
                            if (error) next(error);

                            let participantIds = [];

                            results.forEach(element => {
                                participantIds.push(element.userId);
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
            if (error) next(error);

            const meal = req.body;
            const mealId = req.params.mealId;
            if (isNaN(mealId)) {
                next();
            }

            connection.query(getMealByIdSql, mealId, (error, results, fields) => {

                if (error) next(error);

                if (results[0]) {
                    const cookId = results[0].cookId;

                    const authHeader = req.headers.authorization
                    const token = authHeader.substring(7, authHeader.length);
                    let userId;

                    jwt.verify(token, process.env.JWT_SECRET, function (err, decoded) {
                        userId = decoded.userId;
                    });

                    if (userId === cookId) {
                        let newMeal = {
                            ...results[0],
                            ...meal,
                        }

                        const newMealDataInput = [meal.isActive, meal.isVega, meal.isVegan, meal.isToTakeHome, newMeal.dateTime, newMeal.maxAmountOfParticipants, newMeal.price, newMeal.imageUrl, newMeal.name, newMeal.description, mealId];

                        connection.query(updateMealSql, newMealDataInput, (error, results, fields) => {
                            connection.release();

                            if (error) next(error);

                            res.status(200).json({
                                status: 200,
                                result: newMeal,
                            });
                        });
                    } else {
                        res.status(401).json({
                            status: 401,
                            message: "You are not the owner of this meal"
                        });
                    }

                } else {
                    res.status(401).json({
                        status: 401,
                        message: "This meal does not exist"
                    });
                }

            });
        });
    },

    deleteMeal: (req, res, next) => {
        dbconnection.getConnection(function (err, connection) {
            if (err) next(err);

            const mealId = req.params.mealId;

            connection.query(getMealByIdSql, mealId, (error, results, fields) => {
                connection.release();
                if (error) next(error);

                if (results[0]) {

                    const cookId = results[0].cookId;

                    const authHeader = req.headers.authorization
                    const token = authHeader.substring(7, authHeader.length);
                    let userId;

                    jwt.verify(token, process.env.JWT_SECRET, function (err, decoded) {
                        userId = decoded.userId;
                    });

                    if (userId === cookId) {
                        connection.query(deleteMealQuery, mealId, (error, results, fields) => {
                            connection.release();
                            if (error) next(error);

                            res.status(200).json({
                                status: 200,
                                message: "Meal succesfully deleted",
                            });
                        });
                    } else {
                        res.status(401).json({
                            status: 401, 
                            message: "You are not the owner of this meal"
                        })
                    }
                } else {
                    res.status(401).json({
                        status: 401,
                        message: "This meal does not exist"
                    })
                }


            });
        });
    }
}

module.exports = controller