AppCenter project does the following using App Center API(https://openapi.appcenter.ms/#/build)
- Receive list of branches for the app and build them
- Print the following information to console output
< branch name > build < completed/failed > in 125 seconds. Link to build logs: < link >

INSTALLATION
- npm install
- copy  the content of .env.template file into .env file
- install the script globally: npm install -g .

BUILD THE APP
- npm run build

RUN THE APP
- get-builds

UNINSTALLING
npm uninstall -g appcenter-cli