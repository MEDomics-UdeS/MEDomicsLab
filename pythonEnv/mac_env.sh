conda create -n test2 python==3.9.18 -y || {
    echo "An error occurred while creating the new environment."
    exit 1
}

# Activate the new environment
echo "Activating the environment..."
conda activate test2 || {
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
    exit 1
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


