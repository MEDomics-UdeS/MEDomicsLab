# Getting started - Development

## 1. Install nvm (Node Version Manager)

Ubuntu : https://github.com/nvm-sh/nvm#installing-and-updating

Windows : https://github.com/coreybutler/nvm-windows

## 2. Install npm and node.js

```
nvm install lts # lts :Long Term Support
nvm use lts
```

## 3. Setup server side

- [Go Setup here](./go_server/README.md) (Optional: useful for adding new features to the server)
- Configure the **python environment** by executing (you can run this once) :
  - Windows : `.\pythonEnv\create_conda_env_win.bat`
  - Linux : `bash pythonEnv/create_venv_linux.sh`
- regenerating Go executable :
  - Windows : `.\utilScripts\pack_GO.bat`
  - Linux : `bash utilScripts/pack_GO.sh`

## 4. initialize submodules

```
cd <.../MEDomicsLab/>
git submodule init
git submodule update --init --recursive --remote
cd pythonCode/submodules/MEDimage
git checkout dev_lab
cd ../MEDprofiles
git checkout fusion_MEDomicsLab
```

## 5. Run the Electron app in development mode

```
cd <.../MEDomicsLab/>
npm install
npm run dev
```

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

# Getting started - Production

At this step, you should have already completed the steps in the "Getting started - Development" section.

## 1. Build the Electron app

> Configuration can be found in package.json under key "build" and documention can be found here: https://www.electron.build/index.html

#### 1.1. Build for Windows

- Execute the following command: `npm run build:win`
- The built app will be located in the `build/dist` folder

[...TODO...]

## 2. Publish the Electron app

[...TODO...]

# Getting started

## 1. Install the latest release

= insert latest release link here =

## 2. Install the environment creation tool

- Download the environment creation tool here: = insert latest release link here =
- Extract the zip file
- Run the executable by double clicking on it (.bat file for Windows, .sh file for Linux and Mac)
