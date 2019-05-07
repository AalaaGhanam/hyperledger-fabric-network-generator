const express = require("express");
const router = express.Router();
const bodyParser = require('body-parser');
const { createDockerCompose} = require('../controllers/index');

router.use(bodyParser.json());

router.route('/')
    .post(createDockerCompose)
    
module.exports = router;