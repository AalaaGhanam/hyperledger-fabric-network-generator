const express = require('express');
const index = require('./routes/index');
const bodyParser = require('body-parser');

//Init app
const app = express();

//Start server
app.listen(8081, function () {
    console.log("Server started on port 8081.....")
 })

//Routes
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/', index);