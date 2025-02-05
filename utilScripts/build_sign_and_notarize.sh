#!/bin/bash

# Get the latest tag
latest_tag=$(git describe --tags --abbrev=0 2>/dev/null)

if [ -z "$latest_tag" ]; then
    echo "No existing tags found. Starting with v0.1.0"
    new_tag="v0.1.0"
else
    # Extract version numbers
    version=$(echo $latest_tag | sed 's/v//')
    major=$(echo $version | cut -d. -f1)
    minor=$(echo $version | cut -d. -f2)
    patch=$(echo $version | cut -d. -f3)

    # Increment patch version
    patch=$((patch + 1))
    new_tag="v$major.$minor.$patch"
    new_tag_wo_v="$major.$minor.$patch"
fi

echo "Previous tag: $latest_tag"
echo "New tag: $new_tag"
echo "New tag without v: $new_tag_wo_v"

# Fetch the latest changes and the submodules
git fetch --all
git submodule update --init --recursive

# Checkout the correct branches
git submodule foreach '
if [ "$name" = "pythonCode/submodules/MEDimage" ]; then
git fetch origin && git checkout -B dev_lab origin/dev_lab && git pull origin dev_lab
elif [ "$name" = "pythonCode/submodules/MEDprofiles" ]; then
git fetch origin && git checkout -B fusion_MEDomicsLab origin/fusion_MEDomicsLab && git pull origin fusion_MEDomicsLab
else
echo "No branch specified for $name"
fi
'

# Update the npm packages
npm install

# Prebuild libmongocrypt
bash ./utilScripts/build_libmongocrypt.sh

# Update the version in the package.json
node -p "let pkg=require('./package.json'); pkg.version='$new_tag_wo_v'; require('fs').writeFileSync('package.json', JSON.stringify(pkg, null, 2));"

# build the app
npm run build:mac

# Sign 
# productsign --sign "Developer ID Installer: NICOLAS LONGCHAMPS (5ML683U677)" build/dist/MEDomicsLab-$new_tag_wo_v-mac.pkg build/dist/MEDomicsLab-$new_tag_wo_v-mac-signed.pkg

xcrun notarytool submit build/dist/MEDomicsLab-$new_tag_wo_v-mac-signed.pkg --keychain-profile "my-api-key-profile" --wait

