FROM node:12.16.0

RUN npm install -g node-gyp
RUN git clone --single-branch --branch staging https://github.com/PharmaLedger-IMI/csc-workspace-main csc-workspace
WORKDIR csc-workspace
COPY ./trust-loader-config-deployment ./trust-loader-config
RUN ls && npm run dev-install --unsafe-perm
RUN echo 'npm run server & \n sleep 1m \n npm run build-all \n tail -f /dev/null' >> startup-script.sh
ENTRYPOINT ["sh", "startup-script.sh"]