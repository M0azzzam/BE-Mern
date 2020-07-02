#!/bin/bash

tar czf dep_stage.tar.gz package.json .babelrc yarn.lock src ecosystem.stage.config.js
scp  -i test-service-desk-app.pem dep_stage.tar.gz ubuntu@ec2-3-89-115-85.compute-1.amazonaws.com:~
rm dep_stage.tar.gz

ssh -i test-service-desk-app.pem ubuntu@ec2-3-89-115-85.compute-1.amazonaws.com  << 'ENDSSH'

pm2 stop ~/app/ecosystem.stage.config.js
rm -rf app
mkdir app
tar xf dep_stage.tar.gz -C app
cd app
yarn install
yarn run build
pm2 start ecosystem.stage.config.js

ENDSSH

