const express = require("express");
const router = express.Router();
const bodyParser = require('body-parser');
const { createNetwork} = require('../controllers/index');

router.use(bodyParser.json());

router.route('/')
    .post(createNetwork)
    
module.exports = router;