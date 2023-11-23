#!/bin/bash
eval "$(conda shell.bash hook)"
echo "Checking if Conda is installed..."
command -v conda >/dev/null 2>&1
if [ $? -ne 0 ]; then
    # Download Miniconda installer
    echo "Downloading Miniconda installer..."
    wget https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh -O miniconda-installer.sh || {
        echo "An error occurred while downloading the Miniconda installer."
        exit 1
    }

    # Install Miniconda
    echo "Installing Miniconda..."
    bash miniconda-installer.sh -b -p $HOME/miniconda3 || {
        echo "An error occurred while installing Miniconda."
        exit 1
    }

    # Clean up the installer
    echo "Cleaning up the installer..."
    rm miniconda-installer.sh || {
        echo "An error occurred while cleaning up the installer."
        exit 1
    }

    # Activate the base environment
    echo "Activating the base environment..."
    source $HOME/miniconda3/etc/profile.d/conda.sh || {
        echo "An error occurred while activating the base environment."
        exit 1
    }

else
    # Conda is already installed, create a new environment and install packages
    # Replace <ENV_NAME> with the desired environment name (e.g., med_conda_env)
    # Replace <PYTHON_VERSION> with the desired Python version (e.g., 3.9)
    # Replace <requirements_FILE> with the path to the requirements.txt file

    # Activate the base environment
    echo "Activating the base environment..."
    conda activate base || {
        echo "An error occurred while activating the base environment."
        exit 1
    }

    
fi

CONDA_TYPE=$(conda info | grep -i 'package cache' | awk -F'/' '{print $(NF-1)}')
echo "Conda type: $CONDA_TYPE"

# Check if the environment exists
if conda env list | grep -q 'med_conda_env'; then
    echo "The med_conda_env environment already exists."
else
    # Create a new environment
    echo "Creating a new environment..."
    conda create -n med_conda_env python=3.9 -y || {
        echo "An error occurred while creating the new environment."
        exit 1
    }
fi

# Activate the new environment
echo "Activating the new environment..."
conda activate med_conda_env || {
    echo "An error occurred while activating the new environment."
    exit 1
}

# Install packages from requirements.txt
echo "Installing packages from requirements.txt..."
pip install -r "$(dirname "$0")/requirements.txt" || {
    echo "An error occurred while installing packages from requirements.txt."
    exit 1
}

# Deactivate the new environment
echo "Deactivating the new environment..."
conda deactivate || {
    echo "An error occurred while deactivating the new environment."
    exit 1
}

# Export virtual environment path
echo "Exporting virtual environment path..."
echo "export MED_ENV=$HOME/$CONDA_TYPE/envs/med_conda_env/python" >> ~/.bashrc || {
    echo "An error occurred while exporting the virtual environment path."
    exit 1
}
source ~/.bashrc

echo "Done."