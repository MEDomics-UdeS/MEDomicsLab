# Create a log file
TIME=$(date +"%Y-%m-%d_%H-%M-%S")
LOG_FILE=/tmp/after-install-$TIME.log
echo "After install script is running" >$LOG_FILE
sudo rm /usr/share/keyrings/mongodb-server-8.0.gpg
# sudo rm /etc/apt/sources.list.d/mongodb-org-8.0.list

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

# Get the user name by searching for the user ID

echo "Version: $VERSION" >>$LOG_FILE
sudo apt-get install gnupg curl -y >>$LOG_FILE
curl -fsSL https://www.mongodb.org/static/pgp/server-8.0.asc |
    sudo gpg -o /usr/share/keyrings/mongodb-server-8.0.gpg \
        --dearmor --yes

if [ "$VERSION" = "20.04" ]; then
    echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-8.0.gpg ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/8.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-8.0.list
elif [ "$VERSION" = "22.04" ]; then
    echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-8.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/8.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-8.0.list
elif [ "$VERSION" = "24.04" ]; then
    echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-8.0.gpg ] https://repo.mongodb.org/apt/ubuntu noble/mongodb-org/8.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-8.0.list
fi
echo "Sources list created" >>$LOG_FILE
sudo apt-get update -y >>$LOG_FILE

echo "Installing MongoDB" >>$LOG_FILE
sudo apt-get install -y mongodb-org >>$LOG_FILE

# Start the MongoDB service
echo "Starting MongoDB" >>$LOG_FILE
sudo systemctl daemon-reload >>$LOG_FILE
echo "Daemon reloaded" >>$LOG_FILE

sudo systemctl start mongod >>$LOG_FILE
echo "MongoDB started" >>$LOG_FILE

# # Create the .medomics directory
# MEDOMICS_DIR=~/.medomics
# echo "MEDOMICS_DIR: $MEDOMICS_DIR" >>$LOG_FILE
# if [ ! -d "$MEDOMICS_DIR" ]; then
#     mkdir $MEDOMICS_DIR
# fi

# # Python installation
# # Download the Python tarball
# wget https://github.com/indygreg/python-build-standalone/releases/download/20240224/cpython-3.9.18+20240224-x86_64_v4-unknown-linux-gnu-install_only.tar.gz >>/tmp/after-install.log
# tar -xzf cpython-3.9.18+20240224-x86_64_v4-unknown-linux-gnu-install_only.tar.gz -C $MEDOMICS_DIR

# # Install requirements
# # Get the requirements file from the resources directory
# # https://raw.githubusercontent.com/MEDomics-UdeS/MEDomicsLab/refs/heads/second_packaging_attempt/pythonEnv/merged_requirements.txt

# requirements_url="https://raw.githubusercontent.com/MEDomics-UdeS/MEDomicsLab/refs/heads/second_packaging_attempt/pythonEnv/merged_requirements.txt"
# wget $requirements_url -O $MEDOMICS_DIR/requirements.txt >>$LOG_FILE
# chown -R $SUDO_USER:$SUDO_USER $MEDOMICS_DIR

# /bin/bash $MEDOMICS_DIR/python/bin/pip install --upgrade pip >>$LOG_FILE
# /bin/bash $MEDOMICS_DIR/python/bin/pip install -r $MEDOMICS_DIR/requirements.txt >>$LOG_FILE

# # Remove the tarball
# rm cpython-3.9.18+20240224-x86_64_v4-unknown-linux-gnu-install_only.tar.gz*

# chown -R $SUDO_USER:$SUDO_USER $MEDOMICS_DIR
# chmod -R 755 $MEDOMICS_DIR
