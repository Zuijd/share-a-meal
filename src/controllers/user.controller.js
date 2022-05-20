const assert = require('assert');
const dbconnection = require('../../database/dbconnection');
var Regex = require('regex');
const jwt = require('jsonwebtoken');

let controller = {
    validateUser: (req, res, next) => {
        let user = req.body;
        let {
            firstName,
            lastName,
            street,
            city,
            password,
            emailAdress
        } = user;
        try {
            assert(typeof firstName === 'string', 'Firstname must be a string')
            assert(typeof lastName === 'string', 'Lastname must be a string')
            assert(typeof street === 'string', 'Street must be a string')
            assert(typeof city === 'string', 'City must be a string')
            assert(typeof password === 'string', 'Password must be a string')
            assert(typeof emailAdress === 'string', 'EmailAdress must be a string')
            next();
        } catch (err) {
            res.status(400).json({
                status: 400,
                message: err.message,
            });
        }

    },

    validateEmail: (req, res, next) => {
        var regex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
        const email = req.body.emailAdress;
        if (regex.test(email)) {
            next();
        } else {
            res.status(400).json({
                status: 400,
                message: "Invalid emailAdress"
            })
        }
    },

    validatePassword: (req, res, next) => {
        // /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/
        const regex = /^.{6,}$/;
        const password = req.body.password;
        if (regex.test(password)) {
            next();
        } else {
            res.status(400).json({
                status: 400,
                message: "Password too weak"
            })
        }
    },

    checkMail: (req, res, next) => {
        let user = req.body;
        let {
            emailAdress
        } = user;
        try {
            assert(typeof emailAdress === 'string', 'EmailAdress must be a string')
            next();
        } catch (err) {
            const error = {
                status: 400,
                message: err.message,
            };


            next(error)
        }

    },

    addUser: (req, res, next) => {

        dbconnection.getConnection(function (err, connection) {
            if (err) next(err);

            let user = req.body;

            connection.query(
                'SELECT COUNT(emailAdress) as count FROM user WHERE emailAdress = ?',
                user.emailAdress,
                function (error, results, fields) {

                    if (error) next(error);

                    if (results[0].count > 0) {
                        res.status(409).json({
                            status: 409,
                            message: "User already exist",
                        });
                    } else {
                        connection.query(
                            `INSERT INTO user (firstName, lastName, street, city, password, emailAdress) VALUES ('${user.firstName}', '${user.lastName}', '${user.street}', '${user.city}', '${user.password}', '${user.emailAdress}')`,
                            function (error, results, fields) {
                                connection.release();

                                if (error) next(error);

                                user = {
                                    "id": results.insertId,
                                    ...user,
                                }

                                if (results.affectedRows > 0) {
                                    res.status(201).json({
                                        status: 201,
                                        result: user,
                                    });
                                }
                            });
                    }
                });



        });
    },

    getAllUsers: (req, res, next) => {

        let getUsersQuery = `SELECT * FROM user`;
        let {
            firstName,
            isActive
        } = req.query;
        let varsToAddToQuery = [];

        if (firstName || isActive) {
            getUsersQuery += ` WHERE `;
            if (firstName) {
                getUsersQuery += `firstName LIKE ?`;
                firstName += '%';
                varsToAddToQuery.push(firstName);
            }
            if (firstName && isActive) {
                getUsersQuery += ` AND `;
            }
            if (isActive) {
                getUsersQuery += `isActive = ?`;
                varsToAddToQuery.push(isActive);
            }
        }

        dbconnection.getConnection(function (err, connection) {
            if (err) {
                next(err);
            }



            connection.query(getUsersQuery, varsToAddToQuery, (error, results, fields) => {
                connection.release();

                if (error) {
                    next(error);
                }

                res.status(200).json({
                    status: 200,
                    result: results,
                });
            });
        });
    },

    getUserByid: (req, res) => {

        dbconnection.getConnection(function (err, connection) {
            if (err) next(err);

            const userId = req.params.userId;

            connection.query(
                'SELECT COUNT(id) as count FROM user WHERE id = ?',
                userId,
                function (error, results, fields) {

                    if (error) next(error);


                    if (results[0].count === 0) {
                        res.status(404).json({
                            status: 404,
                            message: "This user does not exist",
                        });
                    } else {
                        connection.query(
                            'SELECT * FROM `user` WHERE `id` = ' + userId + '',
                            function (error, results, fields) {
                                connection.release();

                                if (error) next(error);

                                console.log('#results = ', results.length);
                                res.status(200).json({
                                    status: 200,
                                    result: results[0],
                                });
                            });
                    }
                });




        });
    },

    getUserProfile: (req, res, next) => {

        dbconnection.getConnection((err, connection) => {
            if (err) next(err);

            const authHeader = req.headers.authorization;
            const token = authHeader.substring(7, authHeader.length);
            let userId;

            jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
                if (err) next(err);
                userId = decoded.userId;
            });

            const getUserInfoQuery = `SELECT * FROM user WHERE id = ?`;

            connection.query(getUserInfoQuery, userId, (error, results, fields) => {
                connection.release();
                if (error) next(error);

                res.status(200).json({
                    status: 200,
                    result: results[0]
                })
            });
        });
    },

    updateUser: (req, res, next) => {

        dbconnection.getConnection(function (err, connection) {
            if (err) next(err);

            let user = req.body;
            const userId = req.params.userId;

            connection.query(
                `SELECT COUNT(id) as count FROM user WHERE id = ?`,
                userId,
                function (error, results, fields) {

                    if (error) next(error);

                    if (results[0].count === 0) {
                        res.status(400).json({
                            status: 400,
                            message: "This user does not exist",
                        });
                    } else {
                        connection.query(
                            `SELECT COUNT(emailAdress) as count FROM user WHERE emailAdress = ? AND NOT id = '${userId}'`,
                            user.emailAdress,
                            function (error, results, fields) {

                                if (error) next(error);

                                if (results[0].count > 0) {
                                    res.status(409).json({
                                        status: 409,
                                        message: "This email is alreday taken",
                                    });
                                } else {
                                    connection.query(
                                        'SELECT * FROM `user` WHERE `id` = ' + userId + '',
                                        function (error, results, fields) {

                                            if (error) next(error);

                                            let newUser = {
                                                ...results[0],
                                                ...user,
                                            }

                                            let isActiveNum;

                                            if (newUser === true) {
                                                isActiveNum = 1;
                                            } else {
                                                isActiveNum = 0;
                                            }

                                            connection.query(
                                                `UPDATE user SET firstname = '${newUser.firstName}', lastname = '${newUser.lastName}', street = '${newUser.street}', city = '${newUser.city}', password = '${newUser.password}', emailAdress = '${newUser.emailAdress}', phoneNumber = '${newUser.phoneNumber}', isActive = '${isActiveNum}' WHERE id = '${userId}'`,
                                                function (error, results, fields) {
                                                    connection.release();

                                                    if (error) next(error);

                                                    console.log('#results = ', results.length);
                                                    res.status(200).json({
                                                        status: 200,
                                                        result: newUser,
                                                    });
                                                });
                                        });
                                }
                            });

                    }
                });

        });
    },

    deleteUser: (req, res) => {

        dbconnection.getConnection(function (err, connection) {
            if (err) next(err);

            const userId = req.params.userId;

            connection.query(
                'SELECT COUNT(id) as count FROM user WHERE id = ?',
                userId,
                function (error, results, fields) {

                    if (error) next(error);

                    if (results[0].count === 0) {
                        res.status(400).json({
                            status: 400,
                            message: "User does not exist",
                        });
                    } else {
                        connection.query(
                            `DELETE FROM user WHERE id = '${userId}'`,
                            function (error, results, fields) {
                                connection.release();

                                if (error) next(error);

                                console.log('#results = ', results.length);
                                res.status(200).json({
                                    status: 200,
                                    message: "User succesfully deleted",
                                });
                            });
                    }
                });



        });
    },

}

module.exports = controller