#!/bin/bash
source ~/.zshrc
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
    bash miniconda-installer.sh -u -b -p $HOME/miniconda3 || {
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

      # Initialize Conda
    echo "Initializing Conda..."
    conda init bash

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
    conda create -n med_conda_env python==3.9.18 -y || {
        echo "An error occurred while creating the new environment."
        exit 1
    }
fi

# Activate the new environment
echo "Activating the environment..."
conda activate med_conda_env || {
    echo "An error occurred while activating the new environment."
    exit 1
}

# Install xcode command line tools
echo "Installing xcode command line tools..."
xcode-select --install || {
    echo "An error occurred while installing xcode command line tools."
}

# Check if homebrew is installed
if command -v brew &> /dev/null; then
    echo "Homebrew is already installed."
else
    echo "Homebrew is not installed."
    # Install homebrew
    echo "Installing homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)" || {
    echo "An error occurred while installing homebrew."
    exit 1
    }
    # Add homebrew to PATH in .zprofile and .bash_profile
    echo "Adding homebrew to PATH..."
    echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> /Users/med/.zprofile || {
        echo "An error occurred while adding homebrew to PATH."
        exit 1
    }
    eval "$(/opt/homebrew/bin/brew shellenv)" || {
        echo "An error occurred while adding homebrew to PATH."
        exit 1
    }
fi

# Install libomp
echo "Installing libomp..."
brew install libomp || {
    echo "An error occurred while installing libomp."
    exit 1
}

# Install miniforge
echo "Installing miniforge..."
brew install miniforge || {
    echo "An error occurred while installing miniforge."
    exit 1
}

# Install pycaret without dependencies
echo "Installing pycaret without dependencies..."
pip install pycaret --no-dependencies || {
    echo "An error occurred while installing pycaret without dependencies."
    exit 1
}

# Install packages from mac_requirements.txt
echo "Installing packages from mac_requirements.txt..."
cat mac_requirements.txt | xargs -n 1 conda install -y || {
    echo "An error occurred while installing packages from mac_requirements.txt."
}

conda install -c conda-forge category_encoders -y || {
    echo "An error occurred while installing category_encoders."
    exit 1
}

conda install -c conda-forge python-xxhash -y || {
    echo "An error occurred while installing python-xxhash."
    exit 1
}

pip install xgboost --no-binary xgboost -v || {
    echo "An error occurred while installing xgboost."
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
if grep -q "export MED_ENV=" ~/.zshrc; then
    # Replace the existing MED_ENV environment variable in ~/.zshrc with the new one
        sed -i '' "s|export MED_ENV=.*|export MED_ENV=$HOME/opt/$CONDA_TYPE/envs/med_conda_env/bin/python|" ~/.zshrc || {
        echo "An error occurred while replacing the virtual environment path in ~/.zshrc."
        exit 1
    }
else
    echo "export MED_ENV=$HOME/opt/$CONDA_TYPE/envs/med_conda_env/bin/python" >> ~/.zshrc || {
        echo "An error occurred while exporting the virtual environment path."
        exit 1
    }
fi
source ~/.zshrc

echo "Done."