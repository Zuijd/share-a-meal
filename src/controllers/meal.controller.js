const assert = require('assert');
const dbconnection = require('../../database/dbconnection');
const jwt = require('jsonwebtoken');

//queries
const addMealQuery =
    `INSERT INTO meal (isActive, isVega, isVegan, isToTakeHome, dateTime, maxAmountOfParticipants, price, imageUrl, name, description, allergenes, cookId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
const addParticpantQuery =
    `INSERT INTO meal_participants_user (mealId, userId) VALUES (?, ?)`;

const userByIdQuery =
    `SELECT * FROM user WHERE id = ?`;
const allMealsQuery =
    `SELECT * FROM meal`;
const getParticipantsByMealIdQuery =
    `SELECT * FROM meal_participants_user WHERE mealId = ?`;
const mealByIdQuery =
    `SELECT * FROM meal WHERE id = ?`;

const updateMealQuery =
    `UPDATE meal SET isActive = ?, isVega = ?, isVegan = ?, isToTakeHome = ?, dateTime = ?, maxAmountOfParticipants = ?, price = ?, imageUrl = ?, name = ?, description = ? WHERE id = ?`;

const deleteMealQuery =
    `DELETE FROM meal WHERE id = ?`;


let controller = {

    checkAddMealinput: (req, res, next) => {
        let meal = req.body;
        let {
            name,
            description,
            dateTime,
            imageUrl,
            price,
            isActive, 
            isToTakeHome, 
            isVega, 
            isVegan, 
            maxAmountOfParticipants
        } = meal;
        try {
            assert(typeof name === 'string', 'Name must be a string')
            assert(typeof description === 'string', 'Description must be a string')
            assert(typeof dateTime === 'string', 'DateTime must be a string')
            assert(typeof imageUrl === 'string', 'ImageUrl must be a string')
            assert(typeof price === 'string', 'Price must be a string')
            assert(typeof isActive === 'string', 'IsActive must be a string')
            assert(typeof isToTakeHome === 'string', 'IsToTakeHome must be a string')
            assert(typeof isVega === 'string', 'IsVega must be a string')
            assert(typeof isVegan === 'string', 'IsVegan must be a string')
            assert(typeof maxAmountOfParticipants === 'string', 'MaxAmountOfParticipants must be a string')
            next();
        } catch (err) {
            res.status(400).json({
                status: 400,
                message: err.message,
            });
        }
    },


    getAllMeals: (req, res, next) => {
        dbconnection.getConnection(function (err, connection) {
            if (err) next(err);

            connection.query(allMealsQuery, (error, results, fields) => {
                connection.release();

                if (error) next(error);

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
            const allergenes = req.body.allergenes;
            let allergenesArray = [];
            let allergenesString = "";

            if (allergenes) {
                allergenes.forEach(element => {
                    if (element === "gluten" || element === "noten" || element == "lactose") {
                        if (!(allergenesArray.includes(element))) {
                            allergenesArray.push(element);
                            allergenesString += element + ",";
                        }
                    }
                });
                allergenesString = allergenesString.slice(0, -1);
            }

            const authHeader = req.headers.authorization;
            const token = authHeader.substring(7, authHeader.length);
            let cookId;

            jwt.verify(token, process.env.JWT_SECRET, function (err, decoded) {
                cookId = decoded.userId;
            });


            const mealToAdd = [meal.isActive, meal.isVega, meal.isVegan, meal.isToTakeHome, meal.dateTime, meal.maxAmountOfParticipants, meal.price, meal.imageUrl, meal.name, meal.description, allergenesString, cookId];

            console.log(mealToAdd);


            connection.query(addMealQuery, mealToAdd, (error, results, fields) => {
                connection.release();
                if (error) next(error);

                const mealId = results.insertId;

                connection.query(userByIdQuery, cookId, (error, results, fields) => {
                    connection.release();
                    if (error) next(error);

                    const cookInfo = results[0];

                    connection.query(addParticpantQuery, [mealId, cookId], (error, results, fields) => {
                        connection.release();
                        if (error) next(error);

                        connection.query(getParticipantsByMealIdQuery, mealId, (error, results, fields) => {
                            connection.release();
                            if (error) next(error);

                            let participantIds = [];

                            results.forEach(element => {
                                participantIds.push(element.userId);
                            });

                            let participants = [];
                            participantIds.forEach(element => {
                                connection.query(userByIdQuery, element, (error, results, fields) => {
                                    connection.release();
                                    if (error) next(error);

                                    participants.push(results[0]);

                                    mealFullData = {
                                        "id": mealId,
                                        ...meal,
                                        "cook": cookInfo,
                                        "participants": participants
                                    };

                                    res.status(201).json({
                                        status: 201,
                                        result: mealFullData,
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    },

    getMealById: (req, res, next) => {
        dbconnection.getConnection(function (err, connection) {
            if (err) next(err);

            const mealId = req.params.mealId;
            if (isNaN(mealId)) {
                next();
            }

            connection.query(mealByIdQuery, mealId, (error, results, fields) => {
                connection.release();

                if (error) next(error);
                res.status(200).json({
                    status: 200,
                    result: results[0],
                });
            });
        })
    },

    updateMeal: (req, res, next) => {
        dbconnection.getConnection(function (err, connection) {
            if (err) next(err);

            const meal = req.body;
            const mealId = req.params.mealId;
            if (isNaN(mealId)) {
                next();
            }

            connection.query(mealByIdQuery, mealId, (error, results, fields) => {
                connection.release();
                if (error) next(error);

                let newMeal = {
                    ...results[0],
                    ...meal,
                }

                const newMealDataInput = [meal.isActive, meal.isVega, meal.isVegan, meal.isToTakeHome, newMeal.dateTime, newMeal.maxAmountOfParticipants, newMeal.price, newMeal.imageUrl, newMeal.name, newMeal.description, mealId];

                connection.query(updateMealQuery, newMealDataInput, (error, results, fields) => {
                    connection.release();
                    if (error) next(error);

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
            connection.release();
            if (err) next(err);

            const mealId = req.params.mealId;

            connection.query(deleteMealQuery, mealId, (error, results, fields) => {
                connection.release();
                if (error) next(error);

                res.status(200).json({
                    status: 200,
                    message: "Meal succesfully deleted",
                });
            });
        });
    }
}

module.exports = controller