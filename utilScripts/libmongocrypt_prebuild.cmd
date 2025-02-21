@echo off
REM Clone libmongocrypt repository
git clone --branch node-v6.0.1 https://github.com/mongodb/libmongocrypt.git
cd libmongocrypt

REM Build libmongocrypt node bindings
cd bindings\node

REM Windows requires Git Bash or WSL to run the build-static.sh script
bash ./etc/build-static.sh

npm run rebuild

cd ..\..\..
REM Copy and overwrite the existing node bindings
REM Remove everything in the node_modules/mongodb-client-encryption directory
if exist node_modules\mongodb-client-encryption (
    rmdir /s /q node_modules\mongodb-client-encryption
)
xcopy /E /I /Y libmongocrypt\bindings\node node_modules\mongodb-client-encryption