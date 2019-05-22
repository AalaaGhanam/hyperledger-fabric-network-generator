# hyperledger-fabric-network-generator

generate docker compose file
* run app and start network using  
	```bash
	node app.js  
	```
* request api:   

	```bash
	POST:http://localhost:8081/
	{
	"domainName":"domain.com",
	"ordererName": "orderer",
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
	"Couchdb": 1,
	"channelName": "channel",
	"Language": "node",
	"chaincodeName": "chaincode",
	"ccDirectory": "../"
	}   
	``` 
* stop network:   
  ```bash
	./stop.sh 
	```
