const express = require("express");
const app = express();
require('dotenv').config()

const port = process.env.PORT;
const bodyParser = require("body-parser");
const userRouter = require("./src/routes/user.routes");
const mealsRouter = require("./src/routes/meal.routes");
const authRouter = require("./src/routes/auth.routes");


app.use(bodyParser.json());

app.all("*", (req, res, next) => {
    const method = req.method;
    console.log(`Method ${method} is aangeroepen`);
    next();
});

app.use(userRouter);
app.use(mealsRouter);
app.use(authRouter);

app.all("*", (req, res) => {
    res.status(404).json({
        status: 404,
        message: "End-point not found",
    });
});

app.use((err, req, res, next) => {
    console.log('Error: ' + err.toString());
    res.status(500).json({
        status: 500, 
        message: err.toString()
    });
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});

module.exports = app;