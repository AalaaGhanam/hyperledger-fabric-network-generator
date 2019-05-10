which cryptogen
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
CURRENT_DIR=$PWD

cd crypto-config/peerOrganizations/org1.domain.com/ca/
PRIV_KEY=$(ls *_sk)
cd "$CURRENT_DIR"
sed $OPTS "s/CA0_PRIVATE_KEY/${PRIV_KEY}/g" docker-compose.yaml
cd crypto-config/peerOrganizations/org2.domain.com/ca/
PRIV_KEY=$(ls *_sk)
cd "$CURRENT_DIR"
sed $OPTS "s/CA0_PRIVATE_KEY/${PRIV_KEY}/g" docker-compose.yaml
docker-compose -f docker-compose.yaml up -d
docker ps -a
