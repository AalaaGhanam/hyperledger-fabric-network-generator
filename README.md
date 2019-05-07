# hyperledger-fabric-network-generator

* node app.js  
* request: 

	```bash
	POST:http://localhost:8081/
	body: {  
     "domainName":"domain.com",
	   "ordererName": "orderer",
	   "numberOfOrgs": 2,
	   "Orgs": [
        {
          "name": "org1",
          "numberOfPeers": 2
        },
        {
          "name": "org2",
          "numberOfPeers": 2
        }
      ],
      "Couchdb": 1
  }
	``` 
