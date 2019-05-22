var fs = require("fs");

var shell = require('shelljs');

const createNetwork =  (req, res) => {
	 createdockerCompose(req);
	 createcryptoConfig(req);
	 createconfigtxPort(req);
	 createUtilsFile(req);
	 createScriptFile(req);
	 createStratFile(req);
	 res.send('files generated successfully');
};

const createdockerCompose = (req) => {
	let dockerCompose = fs.createWriteStream('docker-compose-template.yaml');
	let port = 7050;
    let couchdbPort = 5984;
	dockerCompose.write("version: '2'\n\n");
    dockerCompose.write('volumes:\n');
    dockerCompose.write('  '+req.body.ordererName+'.'+req.body.domainName+':\n');
    req.body.Orgs.forEach(function(orgObj) {
        for(let i = 0; i < orgObj.numberOfPeers; i++) {
            dockerCompose.write('  peer' + i + '.' + orgObj.name + '.' + req.body.domainName + ':\n');
        }
		dockerCompose.write('  ca' + (req.body.Orgs).indexOf(orgObj) + '.' + orgObj.name + '.' + req.body.domainName + ':\n');
    });
    //Orderer
    dockerCompose.write('networks:\n');
	dockerCompose.write('  first:\n\n');
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
	dockerCompose.write('    volumes:\n');
	dockerCompose.write('      - ./channel-artifacts/genesis.block:/var/hyperledger/orderer/orderer.genesis.block\n');
	dockerCompose.write('      - ./crypto-config/ordererOrganizations/'+req.body.domainName+'/orderers/'+req.body.ordererName+'.'+req.body.domainName+'/msp:/var/hyperledger/orderer/msp\n');
	dockerCompose.write('      - ./crypto-config/ordererOrganizations/'+req.body.domainName+'/orderers/'+req.body.ordererName+'.'+req.body.domainName+'/tls/:/var/hyperledger/orderer/tls\n');
    dockerCompose.write('      - '+req.body.ordererName+'.'+req.body.domainName+':/var/hyperledger/production/orderer\n');
	dockerCompose.write('    ports:\n');
	dockerCompose.write('      - '+port+':'+port+'\n');
	dockerCompose.write('    networks:\n');
	dockerCompose.write('      - first\n\n');
	 //Couchdb
	 if(req.body.Couchdb == '1') {
		dockerCompose.write('  couchdb0:\n');
		dockerCompose.write('    container_name: couchdb0\n');
		dockerCompose.write('    image: hyperledger/fabric-couchdb\n');
		dockerCompose.write('    environment:\n');
		dockerCompose.write('      - COUCHDB_USER=\n');
		dockerCompose.write('      - COUCHDB_PASSWORD=\n');
		dockerCompose.write('    ports:\n');
		dockerCompose.write('      - "'+couchdbPort+':'+couchdbPort+'"\n');
		dockerCompose.write('    networks:\n');
		dockerCompose.write('      - first\n\n');
}
	req.body.Orgs.forEach(function(orgObj) {
        //CAs
		dockerCompose.write('  ca'+(req.body.Orgs).indexOf(orgObj)+':\n');
		dockerCompose.write('    container_name: ca'+(req.body.Orgs).indexOf(orgObj) + '.' + orgObj.name + '.' + req.body.domainName +'\n');
		dockerCompose.write('    image: hyperledger/fabric-ca:1.4\n');
		dockerCompose.write('    environment:\n');
		dockerCompose.write('      - FABRIC_CA_HOME=/etc/hyperledger/fabric-ca-server\n');
		dockerCompose.write('      - FABRIC_CA_SERVER_CA_NAME=ca'+(req.body.Orgs).indexOf(orgObj)+'\n');
		dockerCompose.write('      - FABRIC_CA_SERVER_TLS_ENABLED=true\n');
		dockerCompose.write('      - FABRIC_CA_SERVER_TLS_CERTFILE=/etc/hyperledger/fabric-ca-server-config/ca'+(req.body.Orgs).indexOf(orgObj) + '.' +orgObj.name+'.'+req.body.domainName+'-cert.pem\n');
		dockerCompose.write('      - FABRIC_CA_SERVER_TLS_KEYFILE=/etc/hyperledger/fabric-ca-server-config/CA'+((req.body.Orgs).indexOf(orgObj))+'_PRIVATE_KEY\n');
		dockerCompose.write('    ports:\n');
		dockerCompose.write('      - '+(port+4)+':'+(port+4)+'\n');
		dockerCompose.write("    command: sh -c 'fabric-ca-server start --ca.certfile /etc/hyperledger/fabric-ca-server-config/ca"+(req.body.Orgs).indexOf(orgObj) + '.' +orgObj.name+'.'+req.body.domainName+"-cert.pem --ca.keyfile /etc/hyperledger/fabric-ca-server-config/CA"+(req.body.Orgs).indexOf(orgObj)+"_PRIVATE_KEY -b admin:adminpw -d'\n");
		dockerCompose.write('    volumes:\n');
		dockerCompose.write('      - ./crypto-config/peerOrganizations/'+orgObj.name+'.'+req.body.domainName+'/ca/:/etc/hyperledger/fabric-ca-server-config\n');
		dockerCompose.write('    networks:\n');
		dockerCompose.write('      - first\n\n');
       
		for(let i = 0; i < orgObj.numberOfPeers; i++) {
            //peers
			dockerCompose.write('  peer'+i+'.'+orgObj.name+'.'+req.body.domainName+':\n');
		    dockerCompose.write('    container_name: peer'+i+'.'+orgObj.name+'.'+req.body.domainName+'\n');
			dockerCompose.write('    image: hyperledger/fabric-peer:1.4\n');
			dockerCompose.write('    environment:\n');
			dockerCompose.write('      - CORE_VM_ENDPOINT=unix:///host/var/run/docker.sock\n');
			dockerCompose.write('      - CORE_VM_DOCKER_HOSTCONFIG_NETWORKMODE=${COMPOSE_PROJECT_NAME}_first\n');
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
			dockerCompose.write('      - CORE_PEER_LISTENADDRESS=0.0.0.0:'+(port+1)+'\n');
            dockerCompose.write('      - CORE_PEER_CHAINCODEADDRESS=peer'+i+'.'+orgObj.name+'.'+req.body.domainName+':'+(port+2)+'\n');
            dockerCompose.write('      - CORE_PEER_CHAINCODELISTENADDRESS=0.0.0.0:'+(port+2)+'\n');
            dockerCompose.write('      - CORE_PEER_GOSSIP_BOOTSTRAP=peer0.'+orgObj.name+'.'+req.body.domainName+':'+(port+1)+'\n');
            dockerCompose.write('      - CORE_PEER_GOSSIP_EXTERNALENDPOINT=peer'+i+'.'+orgObj.name+'.'+req.body.domainName+':'+(port+1)+'\n');
			dockerCompose.write('      - CORE_PEER_LOCALMSPID='+orgObj.name+'MSP\n');
            if(req.body.Couchdb == '1') {
                dockerCompose.write('      - CORE_LEDGER_STATE_STATEDATABASE=CouchDB\n');
                dockerCompose.write('      - CORE_LEDGER_STATE_COUCHDBCONFIG_COUCHDBADDRESS=couchdb0:'+couchdbPort+'\n');
                dockerCompose.write('      - CORE_LEDGER_STATE_COUCHDBCONFIG_USERNAME=\n');
                dockerCompose.write('      - CORE_LEDGER_STATE_COUCHDBCONFIG_PASSWORD=\n');
			}
			dockerCompose.write('    working_dir: /opt/gopath/src/github.com/hyperledger/fabric/peer\n');
			dockerCompose.write('    command: peer node start\n');
			dockerCompose.write('    volumes:\n');
			dockerCompose.write('      - /var/run/:/host/var/run/\n');
			dockerCompose.write('      - ./crypto-config/peerOrganizations/'+orgObj.name+'.'+req.body.domainName+'/peers/peer'+i+'.'+orgObj.name+'.'+req.body.domainName+'/msp:/etc/hyperledger/fabric/msp\n');
			dockerCompose.write('      - ./crypto-config/peerOrganizations/'+orgObj.name+'.'+req.body.domainName+'/peers/peer'+i+'.'+orgObj.name+'.'+req.body.domainName+'/tls:/etc/hyperledger/fabric/tls\n');
            dockerCompose.write('      - peer'+i+'.'+orgObj.name+'.'+req.body.domainName+':/var/hyperledger/production\n');
			if(req.body.Couchdb == '1') {
                dockerCompose.write('    depends_on:\n');
                dockerCompose.write('      - couchdb0\n');
			}
			dockerCompose.write('    ports:\n');
			dockerCompose.write('      - '+(port+1)+':'+(port+1)+'\n');
			dockerCompose.write('    networks:\n');
			dockerCompose.write('      - first\n\n');
			port = port + 1000;
		}
	});
	req.body.Orgs.forEach(function(orgObj) {
		if((req.body.Orgs).indexOf(orgObj) == 0) {
			dockerCompose.write('  cli:\n');
			dockerCompose.write('    container_name: cli\n');
			dockerCompose.write('    image: hyperledger/fabric-tools\n');
			dockerCompose.write('    tty: true\n');
			dockerCompose.write('    environment:\n');
			dockerCompose.write('      - GOPATH=/opt/gopath\n');
			dockerCompose.write('      - CORE_VM_ENDPOINT=unix:///host/var/run/docker.sock\n');
			dockerCompose.write('      - FABRIC_LOGGING_SPEC=info\n');
			dockerCompose.write('      - CORE_PEER_ID=cli\n');
			dockerCompose.write('      - CORE_PEER_ADDRESS=peer0.'+orgObj.name+'.'+req.body.domainName+':7051\n');
			dockerCompose.write('      - CORE_PEER_LOCALMSPID='+orgObj.name+'MSP\n');
			dockerCompose.write('      - CORE_PEER_TLS_ENABLED=true\n');
			dockerCompose.write('      - CORE_PEER_TLS_CERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/'+orgObj.name+'.'+req.body.domainName+'/peers/peer0.'+orgObj.name+'.'+req.body.domainName+'/tls/server.crt\n');
			dockerCompose.write('      - CORE_PEER_TLS_KEY_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/'+orgObj.name+'.'+req.body.domainName+'/peers/peer0.'+orgObj.name+'.'+req.body.domainName+'/tls/server.key\n');
			dockerCompose.write('      - CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/'+orgObj.name+'.'+req.body.domainName+'/peers/peer0.'+orgObj.name+'.'+req.body.domainName+'/tls/ca.crt\n');
			dockerCompose.write('      - CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/'+orgObj.name+'.'+req.body.domainName+'/users/Admin@'+orgObj.name+'.'+req.body.domainName+'/msp\n');
			dockerCompose.write('      - CORE_CHAINCODE_KEEPALIVE=10\n');
			dockerCompose.write('    working_dir: /opt/gopath/src/github.com/hyperledger/fabric/peer\n');
			dockerCompose.write('    command: /bin/bash\n');
			dockerCompose.write('    volumes:\n');
			dockerCompose.write('      - /var/run/:/host/var/run/\n');
			dockerCompose.write('      - ./crypto-config:/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/\n');
			dockerCompose.write('      - ./../chaincode/:/opt/gopath/src/github.com/chaincode\n');
			dockerCompose.write('      - ./scripts:/opt/gopath/src/github.com/hyperledger/fabric/peer/scripts/\n');
			dockerCompose.write('      - ./channel-artifacts:/opt/gopath/src/github.com/hyperledger/fabric/peer/channel-artifacts\n');
			dockerCompose.write('    depends_on:\n');
			dockerCompose.write('      - '+req.body.ordererName+'.'+req.body.domainName+'\n');
			req.body.Orgs.forEach(function(orgObj) {
				for(let i = 0; i < orgObj.numberOfPeers; i++) {
					dockerCompose.write('      - peer' + i + '.' + orgObj.name + '.' + req.body.domainName + '\n');
				}
			});
			dockerCompose.write('    networks:\n');
			dockerCompose.write('      - first\n\n');
		}
	});
	dockerCompose.end();
};

const createcryptoConfig = (req) => {
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
};

const createconfigtxPort = (req) => {
	let configtx = fs.createWriteStream('configtx.yaml');
	configtxPort = 7050;
	configtx.write('Organizations:\n');
	configtx.write('    - &OrdererOrg\n');
	configtx.write('        Name: OrdererOrg\n');
	configtx.write('        ID: OrdererMSP\n');
	configtx.write('        MSPDir: crypto-config/ordererOrganizations/'+req.body.domainName+'/msp\n');
	configtx.write('        Policies:\n');
	configtx.write('            Readers:\n');
	configtx.write('                Type: Signature\n');
	configtx.write(`                Rule: "OR('OrdererMSP.member')"\n`);
	configtx.write('            Writers:\n');
	configtx.write('                Type: Signature\n');
	configtx.write(`                Rule: "OR('OrdererMSP.member')"\n`);
	configtx.write('            Admins:\n');
	configtx.write('                Type: Signature\n');
	configtx.write(`                Rule: "OR('OrdererMSP.admin')"\n\n`);
	req.body.Orgs.forEach(function(orgObj) {
		configtx.write('    - &'+orgObj.name+'\n');
		configtx.write('        Name: '+orgObj.name+'MSP\n');
		configtx.write('        ID: '+orgObj.name+'MSP\n');
		configtx.write('        MSPDir: crypto-config/peerOrganizations/'+orgObj.name+'.'+req.body.domainName+'/msp\n');
		configtx.write('        Policies:\n');
		configtx.write('            Readers:\n');
		configtx.write('                Type: Signature\n');
		configtx.write(`                Rule: "OR('`+orgObj.name+`MSP.admin', '`+orgObj.name+`MSP.peer', '`+orgObj.name+`MSP.client')"\n`);
		configtx.write('            Writers:\n');
		configtx.write('                Type: Signature\n');
		configtx.write(`                Rule: "OR('`+orgObj.name+`MSP.admin', '`+orgObj.name+`MSP.client')"\n`);
		configtx.write('            Admins:\n');
		configtx.write('                Type: Signature\n');
		configtx.write(`                Rule: "OR('`+orgObj.name+`MSP.admin')"\n`);
		configtx.write('        AnchorPeers:\n');
		configtx.write('            - Host: peer0.'+orgObj.name+'.'+req.body.domainName+'\n');
		configtx.write('              Port: '+(configtxPort+1)+'\n');
		for(let i = 0; i < orgObj.numberOfPeers; i++) {
			configtxPort += 1000;
		}		
	});
	configtx.write('Capabilities:\n');
	configtx.write('    Channel: &ChannelCapabilities\n');
	configtx.write('        V1_3: true\n');
	configtx.write('    Orderer: &OrdererCapabilities\n');
	configtx.write('        V1_1: true\n');
	configtx.write('    Application: &ApplicationCapabilities\n');
	configtx.write('        V1_3: true\n');
	configtx.write('        V1_2: false\n');
	configtx.write('        V1_1: false\n\n');
	configtx.write('Application: &ApplicationDefaults\n');
	configtx.write('    Organizations:\n');
	configtx.write('    Policies:\n');
	configtx.write('        Readers:\n');
	configtx.write('            Type: ImplicitMeta\n');
	configtx.write('            Rule: "ANY Readers"\n');
	configtx.write('        Writers:\n');
	configtx.write('            Type: ImplicitMeta\n');
	configtx.write('            Rule: "ANY Writers"\n');
	configtx.write('        Admins:\n');
	configtx.write('            Type: ImplicitMeta\n');
	configtx.write('            Rule: "MAJORITY Admins"\n');
	configtx.write('    Capabilities:\n');
	configtx.write('        <<: *ApplicationCapabilities\n\n');
	configtx.write('Orderer: &OrdererDefaults\n');
	configtx.write('    OrdererType: solo\n');
	configtx.write('    Addresses:\n');
	configtx.write('        - '+req.body.ordererName+'.'+req.body.domainName+':7050\n');
	configtx.write('    BatchTimeout: 2s\n');
	configtx.write('    BatchSize:\n');
	configtx.write('        MaxMessageCount: 10\n');
	configtx.write('        AbsoluteMaxBytes: 99 MB\n');
	configtx.write('        PreferredMaxBytes: 512 KB\n');
	configtx.write('    Kafka:\n');
	configtx.write('        Brokers:\n');
	configtx.write('            - 127.0.0.1:9092\n');
	configtx.write('    Organizations:\n');
	configtx.write('    Policies:\n');
	configtx.write('        Readers:\n');
	configtx.write('            Type: ImplicitMeta\n');
	configtx.write('            Rule: "ANY Readers"\n');
	configtx.write('        Writers:\n');
	configtx.write('            Type: ImplicitMeta\n');
	configtx.write('            Rule: "ANY Writers"\n');
	configtx.write('        Admins:\n');
	configtx.write('            Type: ImplicitMeta\n');
	configtx.write('            Rule: "MAJORITY Admins"\n');
	configtx.write('        BlockValidation:\n');
	configtx.write('            Type: ImplicitMeta\n');
	configtx.write('            Rule: "ANY Writers"\n');
	configtx.write('Channel: &ChannelDefaults\n');
	configtx.write('    Policies:\n');
	configtx.write('        Readers:\n');
	configtx.write('            Type: ImplicitMeta\n');
	configtx.write('            Rule: "ANY Readers"\n');
	configtx.write('        Writers:\n');
	configtx.write('            Type: ImplicitMeta\n');
	configtx.write('            Rule: "ANY Writers"\n');
	configtx.write('        Admins:\n');
	configtx.write('            Type: ImplicitMeta\n');
	configtx.write('            Rule: "MAJORITY Admins"\n');
	configtx.write('    Capabilities:\n');
	configtx.write('        <<: *ApplicationCapabilities\n\n');
	configtx.write('Profiles:\n');
	configtx.write('    TwoOrgsOrdererGenesis:\n');
	configtx.write('        <<: *ChannelDefaults\n');
	configtx.write('        Orderer:\n');
	configtx.write('            <<: *OrdererDefaults\n');
	configtx.write('            Organizations:\n');
	configtx.write('                - *OrdererOrg\n');
	configtx.write('            Capabilities:\n');
	configtx.write('                <<: *OrdererCapabilities\n');
	configtx.write('        Consortiums:\n');
	configtx.write('            SampleConsortium:\n');
	configtx.write('                Organizations:\n');
	req.body.Orgs.forEach(function(orgObj) {
		configtx.write('                    - *'+orgObj.name+'\n');
	});
	configtx.write('    TwoOrgsChannel:\n');
	configtx.write('        Consortium: SampleConsortium\n');
	configtx.write('        <<: *ChannelDefaults\n');
	configtx.write('        Application:\n');
	configtx.write('            <<: *ApplicationDefaults\n');
	configtx.write('            Organizations:\n');
	req.body.Orgs.forEach(function(orgObj) {
		configtx.write('                - *'+orgObj.name+'\n');
	});
	configtx.write('            Capabilities:\n');
	configtx.write('                <<: *ApplicationCapabilities\n');
	configtx.write('    SampleDevModeKafka:\n');
	configtx.write('        <<: *ChannelDefaults\n');
	configtx.write('        Capabilities:\n');
	configtx.write('            <<: *ChannelCapabilities\n');
	configtx.write('        Orderer:\n');
	configtx.write('            <<: *OrdererDefaults\n');
	configtx.write('            OrdererType: kafka\n');
	configtx.write('            Kafka:\n');
	configtx.write('                Brokers:\n');
	configtx.write('                - kafka.domain.com:9092\n');
	configtx.write('            Organizations:\n');
	configtx.write('            - *OrdererOrg\n');
	configtx.write('            Capabilities:\n');
	configtx.write('                <<: *OrdererCapabilities\n');
	configtx.write('        Application:\n');
	configtx.write('            <<: *ApplicationDefaults\n');
	configtx.write('            Organizations:\n');
	configtx.write('            - <<: *OrdererOrg\n');
	configtx.write('        Consortiums:\n');
	configtx.write('            SampleConsortium:\n');
	configtx.write('                Organizations:\n');
	req.body.Orgs.forEach(function(orgObj) {
    	configtx.write('                - *'+orgObj.name+'\n');
	});
	configtx.write('    SampleMultiNodeEtcdRaft:\n');
	configtx.write('        <<: *ChannelDefaults\n');
	configtx.write('        Capabilities:\n');
	configtx.write('            <<: *ChannelCapabilities\n');
	configtx.write('        Orderer:\n');
	configtx.write('            <<: *OrdererDefaults\n');
	configtx.write('            OrdererType: etcdraft\n');
	configtx.write('            EtcdRaft:\n');
	configtx.write('                Consenters:\n');
	configtx.write('                - Host: '+req.body.ordererName+'.'+req.body.domainName+'\n');//
	configtx.write('                  Port: 7050\n');
	configtx.write('                  ClientTLSCert: crypto-config/ordererOrganizations/'+req.body.domainName+'/orderers/'+req.body.ordererName+'.'+req.body.domainName+'/tls/server.crt\n');
	configtx.write('                  ServerTLSCert: crypto-config/ordererOrganizations/'+req.body.domainName+'/orderers/'+req.body.ordererName+'.'+req.body.domainName+'/tls/server.crt\n');
	configtx.write('            Addresses:\n');
	configtx.write('                - '+req.body.ordererName+'.'+req.body.domainName+':7050\n');
	configtx.write('            Organizations:\n');
	configtx.write('            - *OrdererOrg\n');
	configtx.write('            Capabilities:\n');
	configtx.write('                <<: *OrdererCapabilities\n');
	configtx.write('        Application:\n');
	configtx.write('            <<: *ApplicationDefaults\n');
	configtx.write('            Organizations:\n');
	configtx.write('            - <<: *OrdererOrg\n');
	configtx.write('        Consortiums:\n');
	configtx.write('            SampleConsortium:\n');
	configtx.write('                Organizations:\n');
	req.body.Orgs.forEach(function(orgObj) {
		configtx.write('                - *'+orgObj.name+'\n');
	});
	configtx.end();
};

const createUtilsFile = (req) => {
	let port=7051;
	let start = fs.createWriteStream('scripts/utils.sh');
	start.write('ORDERER_CA=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/'+req.body.domainName+'/orderers/'+req.body.ordererName+'.'+req.body.domainName+'/msp/tlscacerts/tlsca.'+req.body.domainName+'-cert.pem\n');
	req.body.Orgs.forEach(function(orgObj) {
		start.write('PEER0_'+orgObj.name+'_CA=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/' + orgObj.name + '.' + req.body.domainName + '/peers/peer0.' + orgObj.name + '.' + req.body.domainName + '/tls/ca.crt\n');
		
	});
	start.write(`
verifyResult() {
	if [ $1 -ne 0 ]; then
		echo "Error " $2
		echo
		exit 1
	fi
}
setOrdererGlobals() {
	CORE_PEER_LOCALMSPID="OrdererMSP"
	CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/`+req.body.domainName+`/orderers/`+req.body.ordererName+`.`+req.body.domainName+`/msp/tlscacerts/tlsca.`+req.body.domainName+`-cert.pem
	CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/`+req.body.domainName+`/users/Admin@`+req.body.domainName+`/msp
}
setGlobals() {
	PEER=$1
	ORG=$2\n`);
port=7051;
	req.body.Orgs.forEach(function(orgObj) {
	for(let i = 0; i < orgObj.numberOfPeers; i++) {
		start.write('CORE_PEER_ADDRESS_'+orgObj.name+'_'+i+'=peer'+i+'.'+orgObj.name+'.'+req.body.domainName+':'+port+'\n');
		port=port+1000;
				}	
	});
	start.write('CORE_PEER_LOCALMSPID="${ORG}MSP"\n');
	start.write('CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/${ORG}.'+req.body.domainName+'/peers/peer${PEER}.${ORG}.'+req.body.domainName+'/tls/ca.crt\n');
	start.write('CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/${ORG}.'+req.body.domainName+'/users/Admin@${ORG}.'+req.body.domainName+'/msp\n');
	
	start.write('     s="CORE_PEER_ADDRESS_${ORG}_${PEER}"\nCORE_PEER_ADDRESS="${!s}"\n');
	start.write(`
  
	if [ "$VERBOSE" == "true" ]; then
	  env | grep CORE
	fi
}
updateAnchorPeers() {
	PEER=$1
	ORG=$2
	setGlobals $PEER $ORG
  
	if [ -z "$CORE_PEER_TLS_ENABLED" -o "$CORE_PEER_TLS_ENABLED" = "false" ]; then
	  set -x\n`);
	  start.write('	  peer channel update -o '+req.body.ordererName+'.'+req.body.domainName+':7050 -c $CHANNEL_NAME -f ./channel-artifacts/${CORE_PEER_LOCALMSPID}anchors.tx >&log.txt\n');
	  start.write(`	  res=$?
	  set +x
	else
	  set -x\n`);
	  start.write('	  peer channel update -o '+req.body.ordererName+'.'+req.body.domainName+':7050 -c $CHANNEL_NAME -f ./channel-artifacts/${CORE_PEER_LOCALMSPID}anchors.tx --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA >&log.txt\n');
	  start.write(`res=$?
	  set +x
	fi
	cat log.txt
	verifyResult $res "Anchor peer update failed"
	sleep $DELAY
	echo
  }
joinChannelWithRetry() {
PEER=$1
ORG=$2
setGlobals $PEER $ORG

set -x
peer channel join -b $CHANNEL_NAME.block >&log.txt
res=$?
set +x
cat log.txt
if [ $res -ne 0 -a $COUNTER -lt $MAX_RETRY ]; then
	COUNTER=$(expr $COUNTER + 1)\n`);
	start.write('	echo "peer${PEER}.${ORG} failed to join the channel, Retry after $DELAY seconds"\n');
	start.write(`	sleep $DELAY
	joinChannelWithRetry $PEER $ORG
else
	COUNTER=1
fi\n`);
start.write('verifyResult $res "After $MAX_RETRY attempts, peer${PEER}.${ORG} has failed to join channel "\n');
start.write(`
}
installChaincode() {
	PEER=$1
	ORG=$2
	setGlobals $PEER $ORG\n`);
	start.write('	VERSION=${3:-1.0}\n');
	start.write('   set -x\n');
	start.write('   peer chaincode install -n '+req.body.chaincodeName+' -v ${VERSION} -l '+req.body.Language+' -p ${CC_SRC_PATH} >&log.txt\n');
	start.write('	res=$?\n');
	start.write('	set +x\n');
	start.write('	cat log.txt\n');
	start.write('	verifyResult $res "Chaincode installation on peer${PEER}.${ORG} has failed"\n');
	start.write(`	echo
  }

  instantiateChaincode() {
	PEER=$1
	ORG=$2
	setGlobals $PEER $ORG\n`);
	start.write('	VERSION=${3:-1.0}\n');
  
	start.write('if [ -z "$CORE_PEER_TLS_ENABLED" -o "$CORE_PEER_TLS_ENABLED" = "false" ]; then\n');
	start.write('  set -x\n');
	LANGUAGE = req.body.Language;
	VERSION = '${VERSION}';
	start.write(`  peer chaincode instantiate -o `+req.body.ordererName+`.`+req.body.domainName+`:7050 -C $CHANNEL_NAME -n `+req.body.chaincodeName+` -l `+req.body.Language+` -v ${VERSION} -c '{"Args":["init","a","100","b","200"]}' -P "AND (`);
	req.body.Orgs.forEach(function(orgObj,i) {
		if( i == 0 ) {
			start.write(`'`+orgObj.name+`MSP.peer'`);
		} else {
			start.write(`,'`+orgObj.name+`MSP.peer'`);
		}
	});
	start.write(`)" >&log.txt\n`);
	start.write('  res=$?\n');
	start.write('  set +x\n');
	start.write('else\n');
	start.write('  set -x\n');
	start.write(`  peer chaincode instantiate -o `+req.body.ordererName+`.`+req.body.domainName+`:7050 --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA -C $CHANNEL_NAME -n `+req.body.chaincodeName+` -l `+req.body.Language+` -v 1.0 -c '{"Args":["init","a","100","b","200"]}' -P "AND (`);
	req.body.Orgs.forEach(function(orgObj,i) {
		if( i == 0 ) {
			start.write(`'`+orgObj.name+`MSP.peer'`);
		} else {
			start.write(`,'`+orgObj.name+`MSP.peer'`);
		}
	});
	start.write(`)" >&log.txt\n`);
	start.write('  res=$?\n');
	start.write('  set +x\n');
	start.write('fi\n');
	start.write('cat log.txt\n');
	start.write('verifyResult $res "Chaincode instantiation on peer${PEER}.${ORG} on channel failed"\n');
	start.write(`echo
  }
  
  upgradeChaincode() {
	PEER=$1
	ORG=$2
	setGlobals $PEER $ORG
  
	set -x
	peer chaincode upgrade -o `+req.body.ordererName+`.`+req.body.domainName+`:7050 --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA -C $CHANNEL_NAME -n `+req.body.chaincodeName+` -v 2.0 -c '{"Args":["init","a","90","b","210"]}' -P "AND (`);
	req.body.Orgs.forEach(function(orgObj,i) {
		if( i == 0 ) {
			start.write(`'`+orgObj.name+`MSP.peer'`);
		} else {
			start.write(`,'`+orgObj.name+`MSP.peer'`);
		}
	});
	start.write(`)"
	res=$?
	set +x
	cat log.txt`);
	start.write('verifyResult $res "Chaincode upgrade on peer${PEER}.org${ORG} has failed"\n');
	start.write(`echo
  }
  chaincodeQuery() {
	PEER=$1
	ORG=$2
	setGlobals $PEER $ORG
	EXPECTED_RESULT=$3
	local rc=1
	local starttime=$(date +%s)
  
	while
	  test "$(($(date +%s) - starttime))" -lt "$TIMEOUT" -a $rc -ne 0
	do
	  sleep $DELAY
	  echo "Attempting to Query peer...$(($(date +%s) - starttime)) secs"
	  set -x
	  peer chaincode query -C $CHANNEL_NAME -n `+req.body.chaincodeName+` -c '{"Args":["query","a"]}' >&log.txt
	  res=$?
	  set +x
	  test $res -eq 0 && VALUE=$(cat log.txt | awk '/Query Result/ {print $NF}')
	  test "$VALUE" = "$EXPECTED_RESULT" && let rc=0
	  
	  test $rc -ne 0 && VALUE=$(cat log.txt | egrep '^[0-9]+$')
	  test "$VALUE" = "$EXPECTED_RESULT" && let rc=0
	done
	echo
	cat log.txt
	if test $rc -eq 0; then
	  echo "===================== Query successful on peer on channel '$CHANNEL_NAME' ===================== "
	else
	  echo "!!!!!!!!!!!!!!! Query result on peer is INVALID !!!!!!!!!!!!!!!!"
	  echo "================== ERROR !!! FAILED to execute End-2-End Scenario =================="
	  echo
	  exit 1
	fi
  }
  fetchChannelConfig() {
	CHANNEL=$1
	OUTPUT=$2
  
	setOrdererGlobals
  
	echo "Fetching the most recent configuration block for the channel"
	if [ -z "$CORE_PEER_TLS_ENABLED" -o "$CORE_PEER_TLS_ENABLED" = "false" ]; then
	  set -x
	  peer channel fetch config config_block.pb -o `+req.body.ordererName+`.`+req.body.domainName+`:7050 -c $CHANNEL --cafile $ORDERER_CA
	  set +x
	else
	  set -x
	  peer channel fetch config config_block.pb -o `+req.body.ordererName+`.`+req.body.domainName+`:7050 -c $CHANNEL --tls --cafile $ORDERER_CA
	  set +x
	fi
  
	echo "Decoding config block to JSON and isolating config to "
	set -x\n`);
	start.write('	configtxlator proto_decode --input config_block.pb --type common.Block | jq .data.data[0].payload.data.config >"${OUTPUT}"\n');
	start.write(`	set +x
  }
  signConfigtxAsPeerOrg() {
	PEERORG=$1
	TX=$2
	setGlobals 0 $PEERORG
	set -x\n`);
	start.write('	peer channel signconfigtx -f "${TX}"\n');
	start.write(`   set +x
  }
  
  createConfigUpdate() {
	CHANNEL=$1
	ORIGINAL=$2
	MODIFIED=$3
	OUTPUT=$4
  
	set -x\n`);
	start.write('	configtxlator proto_encode --input "${ORIGINAL}" --type common.Config >original_config.pb\n');
	start.write('	configtxlator proto_encode --input "${MODIFIED}" --type common.Config >modified_config.pb\n');
	start.write('	configtxlator compute_update --channel_id "${CHANNEL}" --original original_config.pb --updated modified_config.pb >config_update.pb\n');
	start.write('	configtxlator proto_decode --input config_update.pb --type common.ConfigUpdate >config_update.json\n');
	start.write('	configtxlator proto_encode --input config_update_in_envelope.json --type common.Envelope >"${OUTPUT}"\n');
	start.write(`	set +x
  }
  
\n`);
	start.end();
};




const createScriptFile = (req) => {
	let start = fs.createWriteStream('scripts/script.sh');
	start.write(`#!/bin/bash

echo
echo "start building network"
echo
CHANNEL_NAME="$1"
DELAY="$2"
LANGUAGE="$3"
TIMEOUT="$4"
VERBOSE="$5"\n`);
start.write('LANGUAGE=`echo "$LANGUAGE" | tr [:upper:] [:lower:]`\n');
start.write(`	COUNTER=1
MAX_RETRY=10

CC_SRC_PATH="github.com/chaincode/cc_path/go/"
if [ "$LANGUAGE" = "node" ]; then
	CC_SRC_PATH="/opt/gopath/src/github.com/chaincode/cc_path/`+req.body.Language+`/"
fi

if [ "$LANGUAGE" = "java" ]; then
	CC_SRC_PATH="/opt/gopath/src/github.com/chaincode/cc_path/`+req.body.Language+`/"
fi

echo "Channel name : "$CHANNEL_NAME

. scripts/utils.sh

createChannel() {
	setGlobals 0 `+(req.body.Orgs)[0].name+`

	if [ -z "$CORE_PEER_TLS_ENABLED" -o "$CORE_PEER_TLS_ENABLED" = "false" ]; then
				set -x
		peer channel create -o `+req.body.ordererName+`.`+req.body.domainName+`:7050 -c $CHANNEL_NAME -f ./channel-artifacts/channel.tx >&log.txt
		res=$?
				set +x
	else
				set -x
		peer channel create -o `+req.body.ordererName+`.`+req.body.domainName+`:7050 -c $CHANNEL_NAME -f ./channel-artifacts/channel.tx --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA >&log.txt
		res=$?
				set +x
	fi
	cat log.txt
	verifyResult $res "Channel creation failed"
	echo
}
joinChannel () {\n`);
req.body.Orgs.forEach(function(orgObj) {
	for(let i = 0; i < orgObj.numberOfPeers; i++) {
		start.write( `	joinChannelWithRetry `+i+` `+orgObj.name+`
		sleep $DELAY
		echo\n`);
	}		
});
start.write(`}

createChannel
joinChannel
\n`);
req.body.Orgs.forEach(function(orgObj) {
	for(let i = 0; i < orgObj.numberOfPeers; i++) {
		if(i==0){
		start.write( `echo "Updating anchor peers for `+orgObj.name+`"\n`);
		start.write( `updateAnchorPeers 0 `+orgObj.name+`\n`);}
	}		
});
req.body.Orgs.forEach(function(orgObj) {
	for(let i = 0; i < orgObj.numberOfPeers; i++) {
		if( i == 0 ) {
			start.write( `echo "Installing chaincode on peer0.`+orgObj.name+`"\n`);
			start.write( `installChaincode `+i+` `+orgObj.name+`\n`);
		}
	}
});
req.body.Orgs.forEach(function(orgObj) {
	for(let i = 0; i < orgObj.numberOfPeers; i++) {
		if( i == 0 ) {
			start.write( `echo "Instantiating chaincode on peer`+i+`.`+orgObj.name+`"\n`);
			start.write( `instantiateChaincode `+i+` `+orgObj.name+`\n`);
		}	
	}	
});
  start.write( `	
echo
echo "network started successsfully"
echo
exit 0\n`);
	start.end();
};


const createStratFile = (req) => {
	let start = fs.createWriteStream('start.sh');
	start.write('#!/bin/bash\n');
	start.write('export PATH=${PWD}/../bin:${PWD}:$PATH\n');
	start.write('export FABRIC_CFG_PATH=${PWD}\n');
	start.write('export VERBOSE=false\n');
	start.write(`
function networkUp() {
	if [ ! -d "crypto-config" ]; then
		generateCerts
		replacePrivateKey
		generateChannelArtifacts
	fi
	
	docker-compose -f $COMPOSE_FILE up -d 2>&1
	docker ps -a
	
	if [ $? -ne 0 ]; then
		echo "ERROR !!!! Unable to start network"
		exit 1
	fi
	
	docker exec cli scripts/script.sh $CHANNEL_NAME $CLI_DELAY $LANGUAGE $CLI_TIMEOUT $VERBOSE
	if [ $? -ne 0 ]; then
		echo "ERROR !!!! Test failed"
		exit 1
	fi
}
function replacePrivateKey() {
	ARCH=$(uname -s | grep Darwin)
	if [ "$ARCH" == "Darwin" ]; then
	  OPTS="-it"
	else
	  OPTS="-i"
	fi
  
	cp docker-compose-template.yaml docker-compose.yaml
  
	CURRENT_DIR=$PWD\n`);
	req.body.Orgs.forEach(function(orgObj) {
		start.write('	cd crypto-config/peerOrganizations/'+orgObj.name+'.'+req.body.domainName+'/ca/\n');
		start.write('	PRIV_KEY=$(ls *_sk)\n');
		start.write('	cd "$CURRENT_DIR"\n');
		start.write('	sed $OPTS "s/CA'+(req.body.Orgs).indexOf(orgObj)+'_PRIVATE_KEY/${PRIV_KEY}/g" docker-compose.yaml\n');
	});
	start.write(`
	if [ "$ARCH" == "Darwin" ]; then
	  rm docker-compose-e2e.yamlt
	fi
}
function generateCerts() {
	which cryptogen
	if [ "$?" -ne 0 ]; then
	  echo "cryptogen tool not found. exiting"
	  exit 1
	fi
	echo
	echo "Generate certificates using cryptogen tool"
	echo
	if [ -d "crypto-config" ]; then
	  rm -Rf crypto-config
	fi
	set -x
	cryptogen generate --config=./crypto-config.yaml
	res=$?
	set +x
	if [ $res -ne 0 ]; then
	  echo "Failed to generate certificates..."
	  exit 1
	fi
	echo
}
function generateChannelArtifacts() {
	which configtxgen
	if [ "$?" -ne 0 ]; then
	  echo "configtxgen tool not found. exiting"
	  exit 1
	fi
  
	echo "Generating Orderer Genesis block "
	echo "CONSENSUS_TYPE=solo"
	set -x
	configtxgen -profile TwoOrgsOrdererGenesis -channelID first-sys-channel -outputBlock ./channel-artifacts/genesis.block
	res=$?
	set +x
	if [ $res -ne 0 ]; then
	  echo "Failed to generate orderer genesis block..."
	  exit 1
	fi
	echo
	echo "Generating channel configuration transaction 'channel.tx'"
	set -x
	configtxgen -profile TwoOrgsChannel -outputCreateChannelTx ./channel-artifacts/channel.tx -channelID $CHANNEL_NAME
	res=$?
	set +x
	if [ $res -ne 0 ]; then
		echo "Failed to generate channel configuration transaction..."
		exit 1
	fi\n`);
	req.body.Orgs.forEach(function(orgObj) {
		start.write(`
	echo
	echo "Generating anchor peer update for `+orgObj.name+`MSP"
	set -x
	`);
	start.write('		configtxgen -profile TwoOrgsChannel -outputAnchorPeersUpdate ./channel-artifacts/'+orgObj.name+'MSPanchors.tx -channelID $CHANNEL_NAME -asOrg '+orgObj.name+'MSP\n');
	start.write(`
	res=$?
	set +x
	if [ $res -ne 0 ]; then
		echo "Failed to generate anchor peer update for `+orgObj.name+`MSP"
		exit 1
	fi
	echo`);
	});
	start.write(`
}

CLI_TIMEOUT=10
CLI_DELAY=3
CHANNEL_NAME=`+req.body.channelName+`
COMPOSE_FILE=docker-compose.yaml
LANGUAGE=`+req.body.channelName+`

if [ "$1" = "-m" ]; then
  shift
fi
MODE=$1
shift
if [ "$MODE" == "up" ]; then
  EXPMODE="Starting"
elif [ "$MODE" == "generate" ]; then
  EXPMODE="Generating certs and genesis block"
else
  exit 1
fi\n`);

start.write('if [ "${MODE}" == "up" ]; then\n');
start.write('  networkUp\n');
start.write('elif [ "${MODE}" == "generate" ]; then ## Generate Artifacts\n');
start.write('  generateCerts\n');
start.write('  replacePrivateKey\n');
start.write('  generateChannelArtifacts\n');
start.write(`else
  exit 1
fi
`);
	start.on('finish', () => {  
			shell.chmod('+x', './start.sh');
			shell.chmod('+x', './scripts/script.sh');
			shell.chmod('+x', './scripts/utils.sh');
			shell.exec('./start.sh generate');
		  shell.exec('./start.sh up');
	});
	start.end();
};

module.exports = {
    createNetwork
};
