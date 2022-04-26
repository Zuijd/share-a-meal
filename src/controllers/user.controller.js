let database = [];
let id = 0;

let controller = {
    addUser: (req, res) => {
        let movie = req.body;
        let email = req.body.emailAdress;
        let emailcheck = true;

        for (let i = 0; i < database.length; i++) {
            if (database[i].emailAdress == email) {
                emailcheck = false;
            }
        }

        if (emailcheck) {
            id++;
            movie = {
                id,
                ...movie,
            };
            database.push(movie);
            res.status(201).json({
                status: 201,
                result: movie,
            });
        } else {
            res.status(401).json({
                status: 401,
                message: "This email is already linked to a different account!",
            })
        }
    },

    getAllUsers: (req, res) => {
        res.status(200).json({
            status: 200,
            result: database,
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
            res.status(401).json({
                status: 401,
                message: `User with ID ${userId} not found`,
            });
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