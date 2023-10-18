# Getting started

## 1. Install nvm (Node Version Manager)

Ubuntu : https://github.com/nvm-sh/nvm#installing-and-updating

Windows : https://github.com/coreybutler/nvm-windows

## 2. Install npm and node.js

```
nvm install lts # lts :Long Term Support
nvm use lts
```

## 3. Setup server side

[Setup here](./flask_server/README.md)
[Go Setup here](./go_server/README.md) (Optional, in development)

## 4. initialize submodules

```
cd <.../MEDomicsLab/>
git submodule init
git submodule update
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
const  config  = {
    // If true, the server will be run automatically when the app is launched
    runServerAutomatically:  true,
    // If true, use the react dev tools
    useRactDevTools:  false,
    // the path to the conda environment to use for the server
    condaEnv:  fs.readFileSync("./path2condaenv_toDeleteInProd.txt", "utf8").
    replace(/\s/g, ""),
    // the default port to use for the server
    defaultPort:  5000,
    // Either "GO" or "FLASK" (case sensitive)
    serverChoice:  SERVER_CHOICE.GO,
    // Either "FIX" or "AVAILABLE" (case sensitive)
    portFindingMethod:  PORT_FINDING_METHOD.FIX
}
```

# Current folder structure of the nextron project

| Folder | Description |

| ------------- | ---------------------------------------------------------------------------------- |

| /app | Electron files |

| /Flask_server | All server side, python/[flask](https://flask.palletsprojects.com/) related, files |

| /main | Electron related contents |

| /node_modules | Contains saved libraries (created from `npm install`) |

| /renderer | NextJs related content |

| /ressources | Electron ressources (icons, etc.) |

> Nextron automatically generated folders : /app, /main, /nodes_modules, /ressources, /renderer and /resources

_package.json_ & _package-lock.json_ contain libraries informations from [Node.js](https://nodejs.org/en) (npm)
