const express = require("express");
const app = express();
require('dotenv').config()

const port = process.env.PORT;
const bodyParser = require("body-parser");
const router = require("./src/routes/user.routes");


app.use(bodyParser.json());

app.all("*", (req, res, next) => {
    const method = req.method;
    console.log(`Method ${method} is aangeroepen`);
    next();
});

app.use(router);

//default error 
app.all("*", (req, res) => {
    res.status(404).json({
        status: 404,
        message: "End-point not found",
    });
});

app.use((err, req, res, next) => {
    res.status(err.status).json(err);
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});

module.exports = app;