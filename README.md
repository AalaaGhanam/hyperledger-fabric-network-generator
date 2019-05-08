# hyperledger-fabric-network-generator

generate docker compose file by
* run app using  
```bash
node app.js  
```
* request api:   

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
