# Create a log file
LOG_FILE=/tmp/after-install.log
echo "After install script is running" >$LOG_FILE
sudo rm /usr/share/keyrings/mongodb-server-8.0.gpg
sudo rm /etc/apt/sources.list.d/mongodb-org-8.0.list

# Print environment variables
# echo "Environment variables :" >>$LOG_FILE
# printenv >>$LOG_FILE
# # Determine if the OS is Ubuntu or Debian
# if [ -f /etc/debian_version ]; then
#     # Debian
#     echo "Debian" >>/tmp/after-install.log
#     OS="Debian"
#     sudo apt-get install gnupg curl
#     curl -fsSL https://www.mongodb.org/static/pgp/server-8.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-8.0.gpg --dearmor
#     echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-8.0.gpg ] http://repo.mongodb.org/apt/debian bookworm/mongodb-org/8.0 main" | sudo tee /etc/apt/sources.list.d/mongodb-org-8.0.list
#     sudo apt-get update >>/tmp/after-install.log
#     sudo apt-get install -y mongodb-org >>/tmp/after-install.log
# Ubuntu
echo "Ubuntu" >>$LOG_FILE
OS="Ubuntu"
VERSION=$(lsb_release -rs)
echo "Version: $VERSION" >>$LOG_FILE
echo "USER: $ROOT_USER" >>$LOG_FILE
sudo apt-get install gnupg curl -y >>$LOG_FILE
curl -fsSL https://www.mongodb.org/static/pgp/server-8.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-8.0.gpg --dearmor

if [$VERSION == "20.04"]; then
    echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-8.0.gpg ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/8.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-8.0.list
elif [$VERSION == "22.04"]; then
    echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-8.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/8.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-8.0.list
elif [$VERSION == "24.04"]; then
    echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-8.0.gpg ] https://repo.mongodb.org/apt/ubuntu noble/mongodb-org/8.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-8.0.list
fi
sudo apt-get update -y >>$LOG_FILE

sudo apt-get install -y mongodb-org >>$LOG_FILE

sudo systemctl daemon-reload
sudo systemctl start mongod

# Create the .medomics directory
ROOT_USER=$(eval echo /home/$SUDO_USER)
echo "User home: $ROOT_USER" >>$LOG_FILE
MEDOMICS_DIR="$ROOT_USER/.medomics"
if [ ! -d "$MEDOMICS_DIR" ]; then
    mkdir $MEDOMICS_DIR
fi

# Python installation
# Download the Python tarball
wget https://github.com/indygreg/python-build-standalone/releases/download/20240224/cpython-3.9.18+20240224-x86_64_v4-unknown-linux-gnu-install_only.tar.gz >>/tmp/after-install.log
tar -xzvf cpython-3.9.18+20240224-x86_64_v4-unknown-linux-gnu-install_only.tar.gz -C $MEDOMICS_DIR

# Install requirements
# Get the requirements file from the resources directory
# https://raw.githubusercontent.com/MEDomics-UdeS/MEDomicsLab/refs/heads/second_packaging_attempt/pythonEnv/merged_requirements.txt

requirements_url="https://raw.githubusercontent.com/MEDomics-UdeS/MEDomicsLab/refs/heads/second_packaging_attempt/pythonEnv/merged_requirements.txt"
wget $requirements_url -O $MEDOMICS_DIR/requirements.txt >>$LOG_FILE
bin/bash $MEDOMICS_DIR/python/bin/pip install --upgrade pip >>$LOG_FILE
bin/bash $MEDOMICS_DIR/python/bin/pip install -r $MEDOMICS_DIR/requirements.txt >>$LOG_FILE
