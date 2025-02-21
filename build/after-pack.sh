# Go to the app directory
cd build/dist/mac-arm64/MEDomicsLab.app/Contents/Resources/app.asar.unpacked/node_modules/mongodb-client-encryption/prebuilds

# Extract the native module mongodb-client-encryption-v6.0.1-node-v108-darwin-arm64.tar.gz
tar -xvf mongodb-client-encryption-v6.0.1-node-v108-darwin-arm64.tar.gz

# Remove the tar.gz file
rm mongodb-client-encryption-v6.0.1-node-v108-darwin-arm64.tar.gz

# Sign the native module -> build/Release/mongocrypt.node
codesign --force --options runtime --timestamp \
  --sign "Developer ID Application: NICOLAS LONGCHAMPS (5ML683U677)" \
  "build/Release/mongocrypt.node"

# Recompress the native module
tar -czvf mongodb-client-encryption-v6.0.1-node-v108-darwin-arm64.tar.gz build

# Remove the build directory
rm -rf build

# Go back to the app directory
cd ../../../../../../

# Sign the main executable
codesign --force --options runtime --timestamp --sign "Developer ID Application: NICOLAS LONGCHAMPS (5ML683U677)" \
  "build/dist/mac-arm64/MEDomicsLab.app"
