# sed -i "s/runServerAutomatically: false/runServerAutomatically: true/g" medomics.dev.js

parent_folder=$(dirname "$0")
bash "$parent_folder/pack_GO_linux.sh"
