const express = require("express");
const router = express.Router();
const bodyParser = require('body-parser');
const { createNetwork} = require('../controllers/index');
const { verifyInput } = require('../middlewares/index');

router.use(bodyParser.json());

router.post('/', verifyInput, createNetwork);
    
    /*router.post(
        '/', 
        userController.validate('createUser'), 
      
        userController.createUser,
      )
    router.route('/',[
        check('Couchdb').custom(data => {
            if (data == 1) {
                return res.status(401).json({
                    message: 'Auth failed'});
            } 
          })
      ], (req, res) => {
        const { domainName, ordererName, numberOfOrgs, Orgs,  Couchdb, channelName, Language, chaincodeName, CC_SRC_PATH} = req.body
      })
        .post(verifyInput, createNetwork);*/
    
module.exports = router;
