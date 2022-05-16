const dbconnection = require('../../database/dbconnection');
const assert = require('assert');
const jwt = require('jsonwebtoken');

const loginQuery = `SELECT id, firstName, lastName, emailAdress, password FROM user WHERE emailAdress = ?`;
const mealByIdQuery = `SELECT * FROM meal WHERE id = ?`;


const controller = {
    login: (req, res, next) => {
        const {
            emailAdress,
            password,
        } = req.body;


        dbconnection.getConnection(function (err, connection) {
            if (err) next(err);

            connection.query(loginQuery, emailAdress, (error, results, fields) => {
                connection.release();
                if (error) next(error);

                if (results) {
                    const user = results[0];
                    if (user.password = password) {
                        jwt.sign({
                                userId: user.id
                            },
                            process.env.JWT_SECRET, {
                                expiresIn: '100d'
                            },
                            function (err, token) {
                                if (token) {
                                    user.token = token;
                                    res.status(200).json({
                                        status: 200,
                                        result: user,
                                    });
                                }
                                if (err) next(err);
                            });
                    }
                }
            });
        });
    },

    validateToken: (req, res, next) => {
        const authHeader = req.headers.authorization
        if (authHeader) {
            const token = authHeader.substring(7, authHeader.length)

            jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
                if (err) {
                    res.status(401).json({
                        status: 401,
                        message: "Unauthorized"
                    })
                }
                if (payload) {
                    req.userId = payload.userId
                    next()
                }
            })
        } else {
            res.status(401).json({
                status: 401,
                message: "Authorization header is missing"
            })
        }
    },

    checkUserRights: (req, res, next) => {
        dbconnection.getConnection(function (err, connection) {
            if (err) next(err);

            const mealId = req.params.mealId;

            connection.query(mealByIdQuery, mealId, (error, results, fields) => {
                connection.release();
                if (error) next(error);

                if (results[0]) {
                    const cookId = results[0].cookId;

                    const authHeader = req.headers.authorization
                    const token = authHeader.substring(7, authHeader.length);
                    let userId;

                    jwt.verify(token, process.env.JWT_SECRET, function (err, decoded) {
                        if (err) next(err);
                        userId = decoded.userId;
                    });

                    if (userId === cookId) {
                        next();
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
        })
    }


}

module.exports = controller;