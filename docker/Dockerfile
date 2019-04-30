From node:8.11.2

# Yarn please
RUN curl -o- -L https://yarnpkg.com/install.sh | bash

ENV PATH="/root/.yarn/bin:${PATH}"

# Installs these globally WITHIN the container, not our local machine
RUN yarn && yarn global add eslint && yarn global add nodemon && yarn global add ts-node

# Any commands start from this directory IN the container
WORKDIR /usr/src/api
