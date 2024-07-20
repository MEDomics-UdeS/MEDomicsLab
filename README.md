# MEDomicsLab - Develop branch 🛠️

[![GitHub build](https://img.shields.io/github/workflow/status/MEDomics-UdeS/MEDomicsLab/Build%20and%20test%20electron%20app%20on%20push%20to%20develop%20branch)]()
[![GitHub last commit](https://img.shields.io/github/last-commit/MEDomics-UdeS/MEDomicsLab)]()
[![GitHub contributors](https://img.shields.io/github/contributors/MEDomics-UdeS/MEDomicsLab)]()
[![GitHub issues](https://img.shields.io/github/issues/MEDomics-UdeS/MEDomicsLab)]()
[![GitHub forks](https://img.shields.io/github/forks/MEDomics-UdeS/MEDomicsLab)]()
[![GitHub stars](https://img.shields.io/github/stars/MEDomics-UdeS/MEDomicsLab)]()
[![GitHub release](https://img.shields.io/github/release/MEDomics-UdeS/MEDomicsLab)]()
[![GitHub license](https://img.shields.io/github/license/MEDomics-UdeS/MEDomicsLab)]()

Here is the develop branch of the MEDomicsLab project. This branch is used to develop new features and fix bugs. The main branch is used to publish the latest stable version of the project. The develop branch is merged into the main branch when a new stable version is ready to be published.

### Main documentation 👉 [here](https://medomics-udes.gitbook.io/medomicslab-docs/). 👈

### Development documentation 👇

# Getting started - Development

This is considering that you are a developper and want to contribute to the project.

- I am a **user** and want to **install** the latest release: [Go here](https://medomics-udes.gitbook.io/medomicslab-docs/quick-start)
- I am a **developper** and want to **setup the project**: [Go here](https://medomics-udes.gitbook.io/medomicslab-docs/contributing)
- I am a **developper** and i **already setup** the required softwares: **You are at the right place !**

## 1. Git clone the project

```
git clone git@github.com:MEDomics-UdeS/MEDomicsLab.git      # via SSH (recommended)
git clone https://github.com/MEDomics-UdeS/MEDomicsLab.git  # via HTTPS
```

## 2. Initialize submodules when cloning the project

```
cd <.../MEDomicsLab/>
git submodule init
git submodule update --init --recursive --remote
cd pythonCode/submodules/MEDimage
git checkout dev_lab
cd ../MEDprofiles
git checkout fusion_MEDomicsLab
```

## 3. Be sure to have the npm packages installed

```
cd <.../MEDomicsLab/>
npm install
```

## 4. When you modify .go files, you need to rebuild the executable

- You can do it manually by running `go build main.go` in the `go_server` folder
- You can also use a script that you can run from the root folder of the project:
  - Windows : `.\utilScripts\pack_GO.bat`
  - Linux : `bash utilScripts/pack_GO_linux.sh`
  - MacOS : `bash utilScripts/pack_GO_mac.sh`

## 5. Python environment

The python environment is created automatically with the scripts in the `pythonEnv` folder.
You have to run it manually by executing the following commands:

- Windows : `.\pythonEnv\create_conda_env_win.bat`
- Linux : `bash pythonEnv/create_conda_env_linux.sh`
- MacOS : `zsh pythonEnv/create_conda_env_mac.sh`

The script will create a conda environment named `med_conda_env`, install the required packages in it and create an environment variable named `MED_ENV` that contains the path to the environment.

When developping python code, you may need to install new packages. To do so, you can activate the environment and install the package with pip:

```
conda activate med_conda_env
pip install <package_name>
```

## 6. Run the Electron app in development mode

`npm run dev`

### Modify startup settings

1. Go to file `medomics.dev.js`
2. Here is a description of the Object:

```javascript
const config = {
  // If true, the server will be run automatically when the app is launched
  runServerAutomatically: true,
  // If true, use the react dev tools
  useRactDevTools: false,
  // the default port to use for the server, be sure that no programs use it by default
  defaultPort: 5000,
  // Either "FIX" or "AVAILABLE" (case sensitive)
  // FIX 		-­> if defaultPort is used, force terminate and use defaultPort
  // AVAILABLE 	-> if defaultPort is used, iterate to find next available port
  portFindingMethod: PORT_FINDING_METHOD.FIX
}
```
