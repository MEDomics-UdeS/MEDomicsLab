@echo off


echo Checking if Conda is installed...
where conda >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    REM Conda is not installed, download and install Miniconda
    REM Replace <MINICONDA_URL> with the URL of the Miniconda installer
    REM Replace <MINICONDA_FILENAME> with the filename of the Miniconda installer
    REM Replace <INSTALL_PATH> with the desired installation path
    REM Replace <PYTHON_VERSION> with the desired Python version (e.g., 3.9)
    REM Replace <ENV_NAME> with the desired environment name (e.g., med_conda_env)
    REM Replace <REQUIREMENTS_FILE> with the path to the requirements.txt file

    REM Download Miniconda installer
    echo Downloading Miniconda installer...
    curl -o miniconda_installer.exe https://repo.anaconda.com/miniconda/Miniconda3-py39_23.10.0-1-Windows-x86_64.exe || (
        echo An error occurred while downloading the Miniconda installer.
        exit /b 1
    )

    REM Install Miniconda
    echo Installing Miniconda...
    miniconda_installer.exe /quiet /InstallationType=JustMe /AddToPath=0 /RegisterPython=0 /S || (
        echo An error occurred while installing Miniconda.
    )

    REM Clean up the installer
    echo Cleaning up the installer...
    del miniconda_installer.exe || (
        echo An error occurred while cleaning up the installer.
        exit /b 1
    )

    REM Activate the base environment
    echo Activating the base environment...
    call %USERPROFILE%\miniconda3\Scripts\activate || (
        echo An error occurred while activating the base environment.
        exit /b 1
    )

    REM Create a new environment
    echo Creating a new environment...
    conda create -n med_conda_env python=3.9 -y || (
        echo An error occurred while creating the new environment.
        exit /b 1
    )

    REM Activate the new environment
    echo Activating the new environment...
    conda activate med_conda_env || (
        echo An error occurred while activating the new environment.
        exit /b 1
    )

    REM check python version
    echo Checking Python 3.9 version:
    python --version

    REM Install packages from requirements.txt
    echo Installing packages from requirements.txt...
    pip install -r %~dp0requirements.txt || (
        echo An error occurred while installing packages from requirements.txt.
        exit /b 1
    )

    REM Deactivate the new environment
    echo Deactivating the new environment...
    conda deactivate || (
        echo An error occurred while deactivating the new environment.
        exit /b 1
    )

    REM Export virtual environment path (Windows way)
    echo Exporting virtual environment path...
    setx MED_ENV %USERPROFILE%\miniconda3\envs\med_conda_env || (
        echo An error occurred while exporting the virtual environment path.
        exit /b 1
    )

    echo Done.

) ELSE (
    REM Conda is already installed, create a new environment and install packages
    REM Replace <ENV_NAME> with the desired environment name (e.g., med_conda_env)
    REM Replace <PYTHON_VERSION> with the desired Python version (e.g., 3.9)
    REM Replace <REQUIREMENTS_FILE> with the path to the requirements.txt file

    REM Activate the base environment
    echo Activating the base environment...
    conda activate base || (
        echo An error occurred while activating the base environment.
        exit /b 1
    )

    REM Create a new environment
    echo Creating a new environment...
    conda create -n med_conda_env python=3.9 -y || (
        echo An error occurred while creating the new environment.
        exit /b 1
    )

    REM Activate the new environment
    echo Activating the new environment...
    conda activate med_conda_env || (
        echo An error occurred while activating the new environment.
        exit /b 1
    )

    REM Install packages from requirements.txt
    echo Installing packages from requirements.txt...
    pip install -r %~dp0requirements.txt || (
        echo An error occurred while installing packages from requirements.txt.
        exit /b 1
    )
    REM Deactivate the new environment
    echo Deactivating the new environment...
    conda deactivate || (
        echo An error occurred while deactivating the new environment.
        exit /b 1
    )

    REM Export virtual environment path (Windows way)
    echo Exporting virtual environment path...
    setx MED_ENV %USERPROFILE%\miniconda3\envs\med_conda_env\python.exe || (
        echo An error occurred while exporting the virtual environment path.
        exit /b 1
    )

    echo Done.
)