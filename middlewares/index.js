const fs = require('fs');
const ncp = require('ncp').ncp;

const verifyInput = (req, res, next) => {
    try {
        const { domainName, ordererName, Orgs,  Couchdb, channelName, Language, chaincodeName, ccDirectory} = req.body
        if (domainName && ordererName && Orgs &&  Couchdb && channelName && Language && chaincodeName && ccDirectory) { 
            counter = 0;
            Language.toLowerCase();
            directory = (Language == 'golang') ? 'go' : Language;
            if( Orgs.length < 1) {
                return res.status(401).json({
                    message: 'number of organization should be at least one organization'});
            } else if( Couchdb != '1' && Couchdb != '0') {
                return res.status(401).json({
                    message: 'Couchdb should be boolean'});
            } else if( Language != "node" && Language != "java" && Language != "golang") {
                return res.status(401).json({
                    message: 'wrong type of language'});
            }  else if (fs.existsSync(ccDirectory)) {
                ncp(ccDirectory, './../chaincode/cc_path/'+directory, function (err) {
                    if (err) {
                        return res.status(401).json({
                            message: 'chaincodeDirectory doesn\'t exists'});
                    }
                });
            }
            Orgs.forEach(function(orgObj) {
                if( !(orgObj.name) ) {
                    counter = counter + 1;
                } if( orgObj.numberOfPeers < 1) {
                    counter = counter + 1;
                }
            });
            if (counter > 0) {
                return res.status(401).json({
                    message: 'invalid organization'});
            }
            next();
        } else {
            return res.status(401).json({
                message: 'some data missing'});
        }
    } catch (error) {
        return res.status(401).json({
            message: 'sending data failed'
        });
    }
};

module.exports = {
    verifyInput
};