## Refactored MEDomicsLab app branches

- **nextron** is the main branch of the refactor, all active branches used to refactor the app on main stem from this branch.
- **nextron_Andreanne** is a branch currently used to refactor the extraction tab of MEDomicsLab app. The code on this branch can't be used for any other feature of the MEDomicsLab app for the moment.

## Procedure to setup the project on the branch nextron of MEDomicsLab

### 1. Install nvm (Node Version Manager)

Ubuntu : https://github.com/nvm-sh/nvm#installing-and-updating

Windows : https://github.com/coreybutler/nvm-windows

### 2. Install npm and node.js

```
nvm install lts # lts :Long Term Support
nvm use lts
```

### 3. Run the Electron app in development mode

```
cd <.../MEDomicsLab>
npm install
npm run dev
```

### 4. (Optional) Build the Electron app (production build)

```
npm run build
```

_The executable/setup file will be found in the /dist folder._

## Current folder structure of the nextron project

| Folder        | Description                                                                        |
| ------------- | ---------------------------------------------------------------------------------- |
| /app          | Electron files                                                                     |
| /Flask_server | All server side, python/[flask](https://flask.palletsprojects.com/) related, files |
| /local        | Default local data storing                                                         |
| /main         | Electron related contents                                                          |
| /node_modules | Contains saved libraries (created from `npm install`)                              |
| /renderer     | NextJs related content                                                             |
| /ressources   | Electron ressources (icons, etc.)                                                  |

> Nextron automatically generated folders : /app, /main, /nodes_modules, /ressources, /renderer and /resources

_package.json_ & _package-lock.json_ contain libraries informations from [Node.js](https://nodejs.org/en) (npm)
