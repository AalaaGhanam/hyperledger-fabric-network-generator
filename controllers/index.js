var fs = require("fs");



var shell = require('shelljs');



const createNetwork =  (req, res) => {

	 createdockerCompose(req);

	 createcryptoConfig(req);

	 createconfigtxPort(req);

	 createStratFile(req);

		

res.send('network created successfully');

	



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

	dockerCompose.write('      - ./crypto-config/peerOrganizations/'+req.body.domainName+'/orderers/'+req.body.ordererName+'.'+req.body.domainName+'/msp:/var/hyperledger/orderer/msp\n');

	dockerCompose.write('      - ./crypto-config/peerOrganizations/'+req.body.domainName+'/orderers/'+req.body.ordererName+'.'+req.body.domainName+'/var/hyperledger/orderer/tls\n');

    dockerCompose.write('      - '+req.body.ordererName+'.'+req.body.domainName+':/var/hyperledger/production/orderer\n');

	dockerCompose.write('    ports:\n');

	dockerCompose.write('      - '+port+':'+port+'\n');

	dockerCompose.write('    networks:\n');

	dockerCompose.write('      - first\n\n');

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

            dockerCompose.write('      - first\n\n');

        }

		for(let i = 0; i < orgObj.numberOfPeers; i++) {

            //peers

			dockerCompose.write('  peer'+i+'.'+orgObj.name+'.'+req.body.domainName+':\n');

		    dockerCompose.write('    container_name: peer'+i+'.'+orgObj.name+'.'+req.body.domainName+'\n');

			dockerCompose.write('    image: hyperledger/fabric-peer:1.4\n');

			dockerCompose.write('    environment:\n');

			dockerCompose.write('      - CORE_VM_ENDPOINT=unix:///host/var/run/docker.sock\n');

			dockerCompose.write('      - CORE_VM_DOCKER_HOSTCONFIG_NETWORKMODE=oo_first\n');

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

            if(req.body.Couchdb == 1) {

                dockerCompose.write('      - CORE_LEDGER_STATE_STATEDATABASE=CouchDB\n');

                dockerCompose.write('      - CORE_LEDGER_STATE_COUCHDBCONFIG_COUCHDBADDRESS=couchdb'+(req.body.Orgs).indexOf(orgObj)+':'+couchdbPort+'\n');

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

			if(req.body.Couchdb == 1) {

                dockerCompose.write('    depends_on:\n');

                dockerCompose.write('      - couchdb'+(req.body.Orgs).indexOf(orgObj)+'\n');

			}

			dockerCompose.write('    ports:\n');

			dockerCompose.write('      - '+(port+1)+':'+(port+1)+'\n');

			dockerCompose.write('    networks:\n');

			dockerCompose.write('      - first\n\n');

			port = port + 1000;

		}

		couchdbPort = couchdbPort + 1000;

	});

	req.body.Orgs.forEach(function(orgObj) {

		if((req.body.Orgs).indexOf(orgObj) == 0) {

			dockerCompose.write('  cli:\n');

			dockerCompose.write('    container_name: cli\n');

			dockerCompose.write('    image: hyperledger/fabric-orderer:1.4\n');

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

	configtx.write("                Rule: 'OR('OrdererMSP.member')'\n");

	configtx.write('            Writers:\n');

	configtx.write('                Type: Signature\n');

	configtx.write("                Rule: 'OR('OrdererMSP.member')'\n");

	configtx.write('            Admins:\n');

	configtx.write('                Type: Signature\n');

	configtx.write("                Rule: 'OR('OrdererMSP.admin')'\n\n");

	req.body.Orgs.forEach(function(orgObj) {

		configtx.write('    - &'+orgObj.name+'\n');

		configtx.write('        Name: '+orgObj.name+'MSP\n');

		configtx.write('        ID: '+orgObj.name+'MSP\n');

		configtx.write('        MSPDir: crypto-config/peerOrganizations/'+orgObj.name+'.'+req.body.domainName+'/msp\n');

		configtx.write('        Policies:\n');

		configtx.write('            Readers:\n');

		configtx.write('                Type: Signature\n');

		configtx.write("                Rule: 'OR('"+orgObj.name+"MSP.admin', '"+orgObj.name+"MSP.peer', '"+orgObj.name+"MSP.client')'\n");

		configtx.write('            Writers:\n');

		configtx.write('                Type: Signature\n');

		configtx.write("                Rule: 'OR('"+orgObj.name+"MSP.admin', '"+orgObj.name+"MSP.client')'\n");

		configtx.write('            Admins:\n');

		configtx.write('                Type: Signature\n');

		configtx.write("                Rule: 'OR('"+orgObj.name+"MSP.admin'\n");

		configtx.write('        AnchorPeers:\n');

		configtx.write('            - Host: peer0.'+orgObj.name+'.'+req.body.domainName+'\n');

		configtx.write('            Port: '+(configtxPort+1)+'\n');

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

	configtx.write('        Writers:\n');

	configtx.write('            Type: ImplicitMeta\n');

	configtx.write('            Rule: "MAJORITY Admins"\n');

	configtx.write('    Capabilities:\n');

	configtx.write('        <<: *ApplicationCapabilities\n\n');

	configtx.write('Orderer: &OrdererDefaults\n');

	configtx.write('    OrdererType: solo\n');

	configtx.write('    Addresses:\n');

	configtx.write('        - '+req.body.ordererName+'.'+req.body.domainName+':7050\n');

	configtx.write('    BatchTimeout: 2s\n');

	configtx.write('    BatchSize:"\n');

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

	configtx.write('        Writers:\n');

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

	configtx.write('        Writers:\n');

	configtx.write('            Type: ImplicitMeta\n');

	configtx.write('            Rule: "MAJORITY Admins"\n');

	configtx.write('    Capabilities:\n');

	configtx.write('        <<: *ApplicationCapabilities\n\n');

	configtx.write('Profiles:\n');

	configtx.write('    OrgsOrdererGenesis:\n');

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

	configtx.write('    OrgsChannel:\n');

	configtx.write('        Consortium: SampleConsortium\n');

	configtx.write('        <<: *ChannelDefaults\n');

	configtx.write('        Application:\n');

	configtx.write('            <<: *ApplicationDefaults\n');

	configtx.write('            Organizations:\n');

	req.body.Orgs.forEach(function(orgObj) {

		configtx.write('                    - *'+orgObj.name+'\n');

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

		configtx.write('                    - *'+orgObj.name+'\n');

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

	configtx.write('                Port: 7050\n');

	configtx.write('                ClientTLSCert: crypto-config/ordererOrganizations/'+req.body.domainName+'/orderers/'+req.body.ordererName+'.'+req.body.domainName+'/tls/server.crt\n');

	configtx.write('                ServerTLSCert: crypto-config/ordererOrganizations/'+req.body.domainName+'/orderers/'+req.body.ordererName+'.'+req.body.domainName+'/tls/server.crt\n');

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

		configtx.write('                    - *'+orgObj.name+'\n');

	});

	configtx.end();

};



const createStratFile = (req) => {

	let start = fs.createWriteStream('start.sh');

	start.write(`which cryptogen

if [ "$?" -ne 0 ]; then

echo "cryptogen tool not found. exiting"

exit 1

fi

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

ARCH=$(uname -s | grep Darwin)

if [ "$ARCH" == "Darwin" ]; then

OPTS="-it"

else

OPTS="-i"

fi

cp docker-compose-template.yaml docker-compose.yaml

CURRENT_DIR=$PWD\n

`);

	req.body.Orgs.forEach(function(orgObj) {

		start.write('cd crypto-config/peerOrganizations/'+orgObj.name+'.'+req.body.domainName+'/ca/\n');

		start.write('PRIV_KEY=$(ls *_sk)\n');

		start.write('cd "$CURRENT_DIR"\n');

		start.write('sed $OPTS "s/CA0_PRIVATE_KEY/${PRIV_KEY}/g" docker-compose.yaml\n');

	});

	start.write('docker-compose -f docker-compose.yaml up -d\n');

	start.write('docker ps -a\n');

	start.on('finish', () => {  

	    shell.chmod('+x', './start.sh');

		shell.exec('./start.sh');

	});

	start.end();

};



module.exports = {

    createNetwork

};

