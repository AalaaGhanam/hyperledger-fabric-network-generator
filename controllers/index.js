var fs = require("fs");

const createDockerCompose = (req, res) => {
    let dockerCompose = fs.createWriteStream('docker-compose.yaml');
	let port = 7050;
    let couchdbPort = 5984;
    
	dockerCompose.write("version: '2'\n\n");
    dockerCompose.write('volumes:\n');
    dockerCompose.write('  '+req.body.ordererName+'.'+req.body.domainName+'\n');
    req.body.Orgs.forEach(function(orgObj) {
        for(let i = 0; i < orgObj.numberOfPeers; i++) {
            dockerCompose.write('  peer' + i + '.' + orgObj.name + '.' + req.body.domainName + '\n');
        }
    });

    //Orderer
    dockerCompose.write('networks:\n');
	dockerCompose.write('  bynf:\n\n');
	dockerCompose.write('services:\n\n');
	dockerCompose.write('  '+req.body.ordererName+'.'+req.body.domainName+':\n');
	dockerCompose.write('    container_name: '+req.body.ordererName+'.'+req.body.domainName+'\n');
	dockerCompose.write('    image: hyperledger/fabric-orderer:1.4\n');
	dockerCompose.write('    environment:\n');
	dockerCompose.write('      - FABRIC_LOGGING_SPEC=INFO\n');
	dockerCompose.write('      - ORDERER_GENERAL_LISTENADDRESS=0.0.0.0\n');
	dockerCompose.write('      - ORDERER_GENERAL_GENESISMETHOD=file\n');
	dockerCompose.write('      - ORDERER_GENERAL_GENESISFILE=/var/hyperledger/orderer/orderer.genesis.block\n');
	dockerCompose.write('      - ORDERER_GENERAL_LOCALMSPID=OrdererMSP\n');
	dockerCompose.write('      - ORDERER_GENERAL_LOCALMSPDIR=/var/hyperledger/orderer/msp\n');
	dockerCompose.write('      - ORDERER_GENERAL_TLS_ENABLED=true\n');
	dockerCompose.write('      - ORDERER_GENERAL_TLS_PRIVATEKEY=/var/hyperledger/orderer/tls/server.key\n');
	dockerCompose.write('      - ORDERER_GENERAL_TLS_CERTIFICATE=/var/hyperledger/orderer/tls/server.crt\n');
	dockerCompose.write('      - ORDERER_GENERAL_TLS_ROOTCAS=[/var/hyperledger/orderer/tls/ca.crt]\n');
	dockerCompose.write('      - ORDERER_KAFKA_TOPIC_REPLICATIONFACTOR=1\n');
	dockerCompose.write('      - ORDERER_KAFKA_VERBOSE=true\n');
	dockerCompose.write('      - ORDERER_GENERAL_CLUSTER_CLIENTCERTIFICATE=/var/hyperledger/orderer/tls/server.crt\n');
	dockerCompose.write('      - ORDERER_GENERAL_CLUSTER_CLIENTPRIVATEKEY=/var/hyperledger/orderer/tls/server.key\n');
	dockerCompose.write('      - ORDERER_GENERAL_CLUSTER_ROOTCAS=[/var/hyperledger/orderer/tls/ca.crt]\n');
	dockerCompose.write('    working_dir: /opt/gopath/src/github.com/hyperledger/fabric\n');
	dockerCompose.write('    command: orderer\n');
	dockerCompose.write('    ports:\n');
	dockerCompose.write('      - '+port+':'+port+'\n');
	dockerCompose.write('    volumes:\n');
	dockerCompose.write('      - ../channel-artifacts/genesis.block:/var/hyperledger/orderer/orderer.genesis.block\n');
	dockerCompose.write('      - ../crypto-config/peerOrganizations/'+req.body.domainName+'/orderers/'+req.body.ordererName+'.'+req.body.domainName+'/msp:/var/hyperledger/orderer/msp\n');
	dockerCompose.write('      - ../crypto-config/peerOrganizations/'+req.body.domainName+'/orderers/'+req.body.ordererName+'.'+req.body.domainName+'/var/hyperledger/orderer/tls\n');
    dockerCompose.write('      - '+req.body.ordererName+'.'+req.body.domainName+':/var/hyperledger/production/orderer\n');
	dockerCompose.write('    networks:\n');
	dockerCompose.write('      - bynf\n\n');


	req.body.Orgs.forEach(function(orgObj) {
        //CAs
		dockerCompose.write('  ca.'+orgObj.name+'.'+req.body.domainName+':\n');
		dockerCompose.write('    image: hyperledger/fabric-ca:1.4\n');
		dockerCompose.write('    environment:\n');
		dockerCompose.write('      - FABRIC_CA_HOME=/etc/hyperledger/fabric-ca-server\n');
		dockerCompose.write('      - FABRIC_CA_SERVER_CA_NAME=ca-'+orgObj.name+'\n');
		dockerCompose.write('      - FABRIC_CA_SERVER_TLS_ENABLED=true\n');
		dockerCompose.write('      - FABRIC_CA_SERVER_TLS_CERTFILE=/etc/hyperledger/fabric-ca-server-config/ca.'+orgObj.name+'.'+req.body.domainName+'-cert.pem\n');
		dockerCompose.write('      - FABRIC_CA_SERVER_TLS_KEYFILE=/etc/hyperledger/fabric-ca-server-config/CA'+((req.body.Orgs).indexOf(orgObj)+1)+'_PRIVATE_KEY\n');
		dockerCompose.write('    ports:\n');
		dockerCompose.write('      - '+(port+4)+':'+(port+4)+'\n');
		dockerCompose.write("    command: sh -c 'fabric-ca-server start --ca.certfile /etc/hyperledger/fabric-ca-server-config/ca."+orgObj.name+'.'+req.body.domainName+"-cert.pem --ca.keyfile /etc/hyperledger/fabric-ca-server-config/CA"+(req.body.Orgs).indexOf(orgObj)+1+"_PRIVATE_KEY -b admin:adminpw -d'\n");
		dockerCompose.write('    volumes:\n');
		dockerCompose.write('      - ./crypto-config/peerOrganizations/'+orgObj.name+'.'+req.body.domainName+'/ca/:/etc/hyperledger/fabric-ca-server-config\n');
		dockerCompose.write('    container_name: ca.'+orgObj.name+'.'+req.body.domainName+'\n');
		dockerCompose.write('    networks:\n');
		dockerCompose.write('      - bynf\n\n');

        //Couchdb
        if(req.body.Couchdb == 1) {
            dockerCompose.write('  couchdb'+(req.body.Orgs).indexOf(orgObj)+':\n');
            dockerCompose.write('    container_name: couchdb'+(req.body.Orgs).indexOf(orgObj)+'\n');
            dockerCompose.write('    image: hyperledger/fabric-couchdb\n');
            dockerCompose.write('    environment:\n');
            dockerCompose.write('      - COUCHDB_USER=\n');
            dockerCompose.write('      - COUCHDB_PASSWORD=\n');
            dockerCompose.write('    ports:\n');
            dockerCompose.write('      - "'+couchdbPort+':'+couchdbPort+'"\n');
            dockerCompose.write('    networks:\n');
            dockerCompose.write('      - bynf\n\n');
        }

		for(let i = 0; i < orgObj.numberOfPeers; i++) {
            //peers
			dockerCompose.write('  peer'+i+'.'+orgObj.name+'.'+req.body.domainName+':\n');
		    dockerCompose.write('    container_name: peer'+i+'.'+orgObj.name+'.'+req.body.domainName+'\n');
			dockerCompose.write('    image: hyperledger/fabric-peer:1.4\n');
			dockerCompose.write('    environment:\n');
			dockerCompose.write('      - CORE_VM_ENDPOINT=unix:///host/var/run/docker.sock\n');
			dockerCompose.write('      - CORE_VM_DOCKER_HOSTCONFIG_NETWORKMODE=${COMPOSE_PROJECT_NAME}_byfn\n');
			dockerCompose.write('      - FABRIC_LOGGING_SPEC=INFO\n');
			dockerCompose.write('      - CORE_PEER_TLS_ENABLED=true\n');
			dockerCompose.write('      - CORE_PEER_GOSSIP_USELEADERELECTION=true\n');
			dockerCompose.write('      - CORE_PEER_GOSSIP_ORGLEADER=false\n');
			dockerCompose.write('      - CORE_PEER_PROFILE_ENABLED=true\n');
			dockerCompose.write('      - CORE_PEER_TLS_CERT_FILE=/etc/hyperledger/fabric/tls/server.crt\n');
			dockerCompose.write('      - CORE_PEER_TLS_KEY_FILE=/etc/hyperledger/fabric/tls/server.key\n');
			dockerCompose.write('      - CORE_PEER_TLS_ROOTCERT_FILE=/etc/hyperledger/fabric/tls/ca.crt\n');
			dockerCompose.write('      - CORE_PEER_ID=peer'+i+'.'+orgObj.name+'.'+req.body.domainName+'\n');
            dockerCompose.write('      - CORE_PEER_ADDRESS=peer'+i+'.'+orgObj.name+'.'+req.body.domainName+':'+(port+1)+'\n');
            dockerCompose.write('      - CORE_PEER_CHAINCODEADDRESS=peer'+i+'.'+orgObj.name+'.'+req.body.domainName+':'+(port+2)+'\n');
            dockerCompose.write('      - CORE_PEER_CHAINCODELISTENADDRESS=0.0.0.0:'+(port+2)+'\n');
            dockerCompose.write('      - CORE_PEER_GOSSIP_BOOTSTRAP=peer0.'+orgObj.name+'.'+req.body.domainName+':'+(port+1)+'\n');
            dockerCompose.write('      - CORE_PEER_GOSSIP_EXTERNALENDPOINT=peer'+i+'.'+orgObj.name+'.'+req.body.domainName+':'+(port+1)+'\n');
            dockerCompose.write('      - CORE_PEER_LISTENADDRESS=0.0.0.0:'+(port+1)+'\n');
			dockerCompose.write('      - CORE_PEER_LOCALMSPID='+orgObj.name+'MSP\n');
            if(req.body.Couchdb == 1) {
                dockerCompose.write('      - CORE_LEDGER_STATE_STATEDATABASE=CouchDB\n');
                dockerCompose.write('      - CORE_LEDGER_STATE_COUCHDBCONFIG_COUCHDBADDRESS=couchdb'+(req.body.Orgs).indexOf(orgObj)+':'+couchdbPort+'\n');
                dockerCompose.write('      - CORE_LEDGER_STATE_COUCHDBCONFIG_USERNAME=\n');
                dockerCompose.write('      - CORE_LEDGER_STATE_COUCHDBCONFIG_PASSWORD=\n');
            }
			dockerCompose.write('    working_dir: /opt/gopath/src/github.com/hyperledger/fabric/peer\n');
			dockerCompose.write('    command: peer node start\n');
			dockerCompose.write('    ports:\n');
			dockerCompose.write('      - '+(port+1)+':'+(port+1)+'\n');
			dockerCompose.write('    volumes:\n');
			dockerCompose.write('      - /var/run/:/host/var/run/\n');
			dockerCompose.write('      - ../crypto-config/peerOrganizations/'+orgObj.name+'.'+req.body.domainName+'/peers/peer'+i+'.'+orgObj.name+'.'+req.body.domainName+'/msp:/etc/hyperledger/fabric/msp\n');
			dockerCompose.write('      - ../crypto-config/peerOrganizations/'+orgObj.name+'.'+req.body.domainName+'/peers/peer'+i+'.'+orgObj.name+'.'+req.body.domainName+'/tls:/etc/hyperledger/fabric/tls\n');
            dockerCompose.write('      - peer'+i+'.'+orgObj.name+'.'+req.body.domainName+':/var/hyperledger/production\n');
			if(req.body.Couchdb == 1) {
                dockerCompose.write('    depends_on:\n');
                dockerCompose.write('      - couchdb'+(req.body.Orgs).indexOf(orgObj)+'\n');
            }
			dockerCompose.write('    networks:\n');
			dockerCompose.write('      - bynf\n\n');
			port = port + 1000;
		}
		couchdbPort = couchdbPort + 1000;
	});
	dockerCompose.end();
	res.send('docker-compose.yaml created successfully');
};

const createCryptoConfig = (req, res) => {
    let cryptoConfig = fs.createWriteStream('crypto-config.yaml');

	cryptoConfig.write('OrdererOrgs:\n');
	cryptoConfig.write('  - Name: '+req.body.ordererName+'\n');
	cryptoConfig.write('    Domain: '+ req.body.domainName+'\n');
	cryptoConfig.write('    Specs:\n');
	cryptoConfig.write('      - Hostname: orderer\n');
	cryptoConfig.write('PeerOrgs:\n');
	req.body.Orgs.forEach(function(orgObj) {
		cryptoConfig.write('  - Name: '+orgObj.name+'\n');
		cryptoConfig.write('    Domain: '+ orgObj.name+'.'+req.body.domainName+'\n');
		cryptoConfig.write('    EnableNodeOUs: true\n');
		cryptoConfig.write('    Template:\n');
		cryptoConfig.write('      Count: '+orgObj.numberOfPeers+'\n');
		cryptoConfig.write('    Users:\n');
		cryptoConfig.write('      Count: 1\n');
	});
	cryptoConfig.end();
	res.send('crypto-config.yaml created successfully');
};

module.exports = {
    createDockerCompose
};