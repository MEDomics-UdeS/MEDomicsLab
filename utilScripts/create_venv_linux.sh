#!/bin/bash

# Check if Python 3.9 is installed
if ! command -v python3.9 &> /dev/null
then
    # Install Python 3.9
    sudo apt-get update
    sudo apt-get install python3.9
fi

# Create a Python 3.9 virtual environment
python3.9 -m venv venv

# Activate the virtual environment
source venv/bin/activate

# Install requirements from file
pip install -r requirements.txt

# Deactivate the virtual environment
deactivate
