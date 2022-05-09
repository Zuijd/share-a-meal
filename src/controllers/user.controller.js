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

    userExists: (req, res, next) => {
        connection.query(
            'SELECT COUNT(id) as count FROM user WHERE id = ?',
            req.params.userId,
            function (error, results, fields) {

                if (error) throw error;

                if (results[0].count === 0) {
                    res.status(404).json({
                        status: 404,
                        message: "This user does not exist",
                    });
                }
            });
    },

    addUser: (req, res) => {

        dbconnection.getConnection(function (err, connection) {
            if (err) throw err;

            let user = req.body;

            connection.query(
                'SELECT COUNT(emailAdress) as count FROM user WHERE emailAdress = ?',
                user.emailAdress,
                function (error, results, fields) {
                    connection.release();

                    if (error) throw error;

                    if (results[0].count > 0) {
                        res.status(409).json({
                            status: 409,
                            message: "User already exist",
                        });
                    }
                });


            connection.query(
                `INSERT INTO user (firstName, lastName, street, city, password, emailAdress) VALUES ('${user.firstName}', '${user.lastName}', '${user.street}', '${user.city}', '${user.password}', '${user.emailAdress}')`,
                function (error, results, fields) {
                    connection.release();

                    if (error) throw error;

                    if (results.affectedRows > 0) {
                        res.status(201).json({
                            status: 201,
                            result: results,
                        });
                    }
                });
        });
    },

    getAllUsers: (req, res) => {
        dbconnection.getConnection(function (err, connection) {
            if (err) throw err;

            connection.query(
                'SELECT * FROM user',
                function (error, results, fields) {
                    connection.release();

                    if (error) throw error;

                    console.log('#results = ', results.length);
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
                'SELECT * FROM `user` WHERE `id` = ' + userId + '',
                function (error, results, fields) {
                    connection.release();

                    if (error) throw error;

                    console.log('#results = ', results.length);
                    res.status(200).json({
                        status: 200,
                        result: results,
                    });
                });

        });
    },

    getUserProfile: (req, res) => {
        res.status(401).json({
            status: 401,
            message: "This functionality has not been realised (yet)!",
        });
    },

    updateUser: (req, res) => {

        dbconnection.getConnection(function (err, connection) {
            if (err) throw err;

            let user = req.body;
            const userId = req.params.userId;


            // Use the connection
            connection.query(
                `UPDATE user SET firstname = '${user.firstName}', lastname = '${user.lastName}', street = '${user.street}', city = '${user.city}', password = '${user.password}', emailAdress = '${user.emailAdress}' WHERE id = '${userId}'`,
                function (error, results, fields) {
                    connection.release();

                    if (error) throw error;

                    console.log('#results = ', results.length);
                    res.status(200).json({
                        status: 200,
                        result: results,
                    });
                });

        });
    },

    deleteUser: (req, res) => {

        dbconnection.getConnection(function (err, connection) {
            if (err) throw err;

            const userId = req.params.userId;

            connection.query(
                `DELETE FROM user WHERE id = '${userId}'`,
                function (error, results, fields) {
                    connection.release();

                    if (error) throw error;

                    console.log('#results = ', results.length);
                    res.status(200).json({
                        status: 200,
                        result: results,
                    });
                });

        });
    },

}

module.exports = controller