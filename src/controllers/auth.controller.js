const dbconnection = require('../../database/dbconnection');
const assert = require('assert');
const jwt = require('jsonwebtoken');


const controller = {
    login: (req, res, next) => {
        const {
            emailAdress,
            password,
        } = req.body;

        const queryString = `SELECT id, firstName, lastName, emailAdress, password FROM user WHERE emailAdress = ?`;

        dbconnection.getConnection(function (err, connection) {
            if (err) next(err);

            connection.query(queryString, emailAdress, (error, results, fields) => {
                connection.release();

                if (error) next(error);

                if (results) {
                    const user = results[0];
                    if (user.password = password) {
                        jwt.sign({
                                userId: user.id
                            },
                            process.env.JWT_SECRET, {
                                expiresIn: '24h'
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
        const token = req.header;
        console.log(token);
    }
}

module.exports = controller;