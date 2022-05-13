const assert = require('assert')
const dbconnection = require('../../database/dbconnection')

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
            const error = {
                status: 400,
                message: err.message,
            };


            next(error)
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

    addUser: (req, res) => {

        dbconnection.getConnection(function (err, connection) {
            if (err) throw err;

            let user = req.body;

            connection.query(
                'SELECT COUNT(emailAdress) as count FROM user WHERE emailAdress = ?',
                user.emailAdress,
                function (error, results, fields) {

                    if (error) throw error;

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

                                if (error) throw error;

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
        let {firstName, isActive} = req.query;
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
            if (err){
                next(err);
            }

            

            connection.query(getUsersQuery, varsToAddToQuery, (error, results, fields) => {
                    connection.release();

                    if (error){
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
            if (err) throw err;

            const userId = req.params.userId;

            connection.query(
                'SELECT COUNT(id) as count FROM user WHERE id = ?',
                userId,
                function (error, results, fields) {

                    if (error) throw error;


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

                                if (error) throw error;

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

    getUserProfile: (req, res) => {
        res.status(401).json({
            status: 401,
            message: "This functionality has not been realised (yet)!",
        });
    },

    updateUser: (req, res, next) => {

        dbconnection.getConnection(function (err, connection) {
            if (err) throw err;

            let user = req.body;
            const userId = req.params.userId;

            connection.query(
                `SELECT COUNT(id) as count FROM user WHERE id = ?`,
                userId,
                function (error, results, fields) {

                    if (error) throw error;

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

                                if (error) throw error;

                                if (results[0].count > 0) {
                                    res.status(409).json({
                                        status: 409,
                                        message: "This email is alreday taken",
                                    });
                                } else {
                                    connection.query(
                                        'SELECT * FROM `user` WHERE `id` = ' + userId + '',
                                        function (error, results, fields) {

                                            if (error) throw error;

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

                                                    if (error) throw error;

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
            if (err) throw err;

            const userId = req.params.userId;

            connection.query(
                'SELECT COUNT(id) as count FROM user WHERE id = ?',
                userId,
                function (error, results, fields) {

                    if (error) throw error;

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

                                if (error) throw error;

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