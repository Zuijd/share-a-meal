const assert = require('assert')
const dbconnection = require('../../database/dbconnection')

let database = [];
let id = 0;

let controller = {
    validateUser: (req, res, next) => {
        let user = req.body;
        let {
            id,
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
                result: err.message,
            };
            next(error)
        }
    },

    addUser: (req, res) => {
        let user = req.body;
        let email = req.body.emailAdress;
        let emailcheck = true;

        for (let i = 0; i < database.length; i++) {
            if (database[i].emailAdress == email) {
                emailcheck = false;
            }
        }

        if (emailcheck) {
            id++;
            user = {
                id,
                ...user,
            };
            database.push(user);
            res.status(201).json({
                status: 201,
                result: user,
            });
        } else {
            res.status(401).json({
                status: 401,
                message: "This email is already linked to a different account!",
            })
        }
    },

    getAllUsers: (req, res) => {
        dbconnection.getConnection(function (err, connection) {
            if (err) throw err; // not connected!

            // Use the connection
            connection.query(
                'SELECT * FROM user',
                function (error, results, fields) {
                    // When done with the connection, release it.
                    connection.release();

                    // Handle error after the release.
                    if (error) throw error;

                    // Don't use the connection here, it has been returned to the dbconnection.
                    console.log('#results = ', results.length);
                    res.status(200).json({
                        status: 200, 
                        result: results,
                    });
                });

        });
    },

    getUserByid: (req, res) => {
        const userId = req.params.userId;
        if (isNaN(userId)) {
            next();
        }
        let user = database.filter((item) => item.id == userId);
        if (user.length > 0) {
            res.status(200).json({
                status: 200,
                result: user,
            });
        } else {
            const error = {
                status: 404,
                message: `User with ID ${userId} not found`,
            }
            next(error);
        }
    },

    getUserProfile: (req, res) => {
        res.status(401).json({
            status: 401,
            message: "This functionality has not been realised (yet)!",
        });
    }

}

module.exports = controller