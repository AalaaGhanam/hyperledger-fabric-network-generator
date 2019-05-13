docker-compose -f docker-compose-template.yaml down
docker rm -f $(docker ps -aq)
