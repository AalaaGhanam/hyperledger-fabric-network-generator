docker-compose -f docker-compose-template.yaml down --volumes --remove-orphan
docker rm -f $(docker ps -aq)
docker rmi -f $(docker ps -aq)
rm -rf channel-artifacts/*.block channel-artifacts/*.tx crypto-config scripts/*.sh *.yaml start.sh