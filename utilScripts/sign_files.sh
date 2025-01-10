#!/bin/bash

DEVELOPER_ID_APP=$1
BUNDLE_ID=$2
export "DEVELOPER_ID_APP=$DEVELOPER_ID_APP"
export "BUNDLE_ID=$BUNDLE_ID"

signFile() {
  filename=$1
  echo "Signing FILE: $filename"
  codesign -s "$DEVELOPER_ID_APP" -f --timestamp -i "$BUNDLE_ID" -o runtime "$filename"
}

export -f signFile
find . -exec bash -c 'signFile "{}"' \;
