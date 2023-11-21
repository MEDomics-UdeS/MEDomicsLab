#!/bin/bash
GREEN='\033[0;32m'        # Green
BLUE='\033[0;34m'         # Blue
RED='\033[0;31m'          # Red
NC='\033[0m'              # No Color

parent_folder=$(dirname "$0")

# Check if Python 3.9 is installed
echo -e "${BLUE}Checking if Python 3.9 is installed...${NC}"
if ! command -v python3.9 &> /dev/null
then
    echo "Python 3.9 is not installed. Installing Python 3.9..."
    sudo apt-get update
    sudo apt-get install python3.9 || { echo "Error installing Python 3.9."; exit 1; }
fi

# Check if pip is installed
echo -e "${BLUE}Checking if pip is installed...${NC}"
if ! command -v pip &> /dev/null
then
    echo -e "${RED}pip is not installed.${NC}"
    echo -e "${BLUE}Installing pip...${NC}"
    sudo apt-get update
    sudo apt-get install python3-pip || { echo "Error installing pip."; exit 1; }
fi

# Check Python 3.9 version
echo -e "${BLUE}Checking Python 3.9 version: ${NC}" 
python3.9 --version || { echo "Error checking Python 3.9 version."; exit 1; }

# Check if virtualenv is installed
echo -e "${BLUE}Checking if virtualenv is installed...${NC}"
if ! command -v virtualenv &> /dev/null
then
    echo "virtualenv is not installed. Installing virtualenv..."
    sudo apt-get update
    sudo apt-get install python3-virtualenv || { echo "Error installing virtualenv."; exit 1; }
fi

# Check if virtual environment already exists
echo -e "${BLUE}Checking if virtual environment already exists...${NC}"
if [ -d "venv" ]
then
    echo "Virtual environment already exists. Activating virtual environment..."
    source venv/bin/activate || { echo "Error activating virtual environment."; exit 1; }
    echo "Virtual environment activated successfully."
else
    echo "Virtual environment does not exist. Creating virtual environment..."
    python --version || { echo "Error checking Python version."; exit 1; }
    python3.9 -c "import venv" || { echo "Error checking venv module."; exit 1; }
    sudo apt-get install python3.9-venv
    echo -e "${BLUE}Creating a Python 3.9 virtual environment...${NC}"
    python3.9 -m venv venv || { echo "Error creating virtual environment."; exit 1; }
    source venv/bin/activate || { echo "Error activating virtual environment."; exit 1; }
fi

# upgrade pip
echo -e "${BLUE}Upgrading pip...${NC}"
pip install --upgrade pip || { echo "Error upgrading pip."; exit 1; }
pip --version || { echo "Error checking pip version."; exit 1; }
# Install dependencies
echo -e "${BLUE}Installing requirements from file...${NC}"
pip install -r $parent_folder/requirements.txt || { echo "Error installing dependencies. Checking if they are already installed..."; exit 1;}

echo -e "${BLUE}Deactivating the virtual environment...${NC}"
deactivate
# Export virtual environment path to MED_ENV variable in ~/.bashrc
echo -e "${BLUE}Exporting virtual environment path to MED_ENV variable in ~/.bashrc...${NC}"
echo 'export MED_ENV="'$(pwd)'/venv/bin/python"' >> ~/.bashrc
source ~/.bashrc