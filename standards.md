# MEDomicsLab coding standards

## Table of contents

- [Recommended Software](#recommended-software)

- [Project Repository Structure](#project-repository-structure)

- [Style](#style)

- [Naming Conventions](#naming-conventions)

- [Components Structure](#components-structure)

- [Type Hinting](#type-hinting)

- [Syntax](#syntax)

- [Documentation](#documentation)

- [Python Coding Standard](#python-coding-standard)

## Recommended Software

- Windows (10 /11 +), macOs (12 +), Linux (20.04 +)

- [see electron app supported OS](https://www.electronjs.org/de/docs/latest/tutorial/unterst%C3%BCtzung#supported-versions)

- [Visual Studio Code](https://code.visualstudio.com/) extensions:

- [prettier & eslint](https://marketplace.visualstudio.com/items?itemName=rvest.vs-code-prettier-eslint) - code formatter standardizer (see [syntax](#syntax))

- framework used in the platform

- [npmjs](https://www.npmjs.com/) - Library manager for javascript language

- [Electron](https://www.electronjs.org/) - Web based programming for standalone app developpement

- [Nextjs](https://nextjs.org/) - Abstraction of [React](https://react.dev) adding server side rendering and optimisations

- [Flask](https://flask.palletsprojects.com/) - Python backend framework (used because it is lightweight and machine learning is mainly programmed in python)

## Project Repository Structure

| Folder | Description |

| ------------- | ---------------------------------------------------------------------------------- |

| /app | Electron files |

| /flask_server | All server side, python/[flask](https://flask.palletsprojects.com/) related, files |

| /flask_server | All server side, python/[flask](https://flask.palletsprojects.com/) related, files |

| /local | Default local data storing |

| /main | Electron related contents |

| /node_modules | Contains saved libraries (created from `npm install`) |

| /renderer | NextJs related content |

| /ressources | Electron ressources (icons, etc.) |

> Nextron automatically generated folders : /app, /main, /nodes_modules, /ressources, /renderer and /resources

> Nextron automatically generated folders : /app, /main, /nodes_modules, /ressources, /renderer and /resources

## Style

- Use [css react modules](https://create-react-app.dev/docs/adding-a-css-modules-stylesheet/)

- import order (\_app.js)

```javascript

import  'bootstrap/dist/css/bootstrap.min.css';

import <all  other  global  css  libraries>

```

## Naming Conventions

### Javascript/react

- Component : PascalCase

- Component file name : camelCase

- Each file name should be the same as the component defined inside

- Component creation : prioritize function implementation over class

```javascript

export  default  const  myComponent = (someProps) =­> {

return (<></>)

}

```

- Function creation: prioritize arrow implementation

```javascript

const  myFct = (someParams) =­> {}

```

> See [react naming convention](https://www.upbeatcode.com/react/react-naming-conventions/)

## Components Structure

```bash

components

│   navbar.jsx
│
├───extraction
│   │   .gitkeep
│   │   flowCanvas.jsx
│   │   sideBar.jsx
│   │   utilityButtons.jsx
│   │
│   ├───buttonsTypes
│   │       uploadButton.jsx
│   │       viewButton.jsx
│   │
│   └───nodesTypes
│           groupNode.jsx
│           inputNode.jsx
│           standardNode.jsx
│
├───flow
│   │   backdrop.jsx
│   │   btnDiv.jsx
│   │   flowPageBase.jsx
│   │   groupNode.jsx
│   │   handlers.jsx
│   │   node.jsx
│   │   progressBarRequests.jsx
│   │   sidebarAvailableNodes.jsx
│   │   workflowBase.jsx
│   │
│   └───context
│           flowInfosContext.jsx
│           offCanvasBackdropStyleContext.jsx
│
├───layout
│   │   IconSidebar.jsx
│   │   LayoutContext.jsx
│   │   LayoutManager.jsx
│   │   mainContainerFunctional.jsx
│   │   WorkspaceSidebar.jsx
│   │
│   ├───flexlayoutComponents
│   │       NewFeatures.jsx
│   │       PopupMenu.jsx
│   │       TabStorage.jsx
│   │
│   └───SidebarTools
│           components.jsx
│           explorerSidebar.jsx
│           homeSidebar.jsx
│           layoutTestSidebar.jsx
│           searchSidebar.jsx
│
├───learning
│   │   checkOption.jsx
│   │   input.jsx
│   │   modalSettingsChooser.jsx
│   │   workflow.jsx
│   │
│   └───nodesTypes
│           optimizeIO.jsx
│           selectionNode.jsx
│           standardNode.jsx
│
└───mainPages
        application.jsx
        discovery.jsx
        extraction.jsx
        home.jsx
        input.jsx
        layoutTest.jsx
        learning.jsx
        results.jsx

```

> To generate this : ` tree .\renderer\components\ /f`

## Setup of [eslint](https://eslint.org/docs/latest/use/getting-started) and [prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

### Syntax

(ES6 for JS as mentionned by Electron, for Python Electron follows Chromium's Coding Style)

### Installation

- Install prettier and plugin (should be included in package.json so a `npm install` should do it)

  `npm install prettier
eslint-plugin-prettier eslint-config-prettier`

- Install [eslint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) and [prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) extensions
- Open workspace settings
  - Can be accessed directly from this path: .vscode/settings.json
  - Or press `CTRL+SHIFT+P` and type `Preferences: Open Workspace Settings (JSON)`
- Add these lines

```javascript
{
  "eslint.options": {
    "overrideConfigFile": ".eslintrc.js"
  },
  "editor.formatOnSave": true,
  "eslint.validate": ["javascript"],
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}
```

### Usage

There are 2 config files:

- eslint -­> .eslintrc.js
- prettier -> .prettierrc.js

A higher priority is placed on Prettier wich handles basic formatting

> see config file for more information on what it rules

then, all standards rules are placed in eslint config file.
So if you need to add specific rules, it should be in .eslintrc.js file

Use `CTRL+S` to save and format files.
Eslint may triggered error displayed as a red underline so you can hover these conventions error, then click on 'quick fix' and click on 'fix all/the problem(s)'

## Documentation

#### Docstring

```javascript

/**

* @param  {type}  someParams description

* @return  {type} description

* @description

* functionnal description of the function/React object

*/

const  myfct = (someParams) =­> {}

```

#### Comments

- Do not over detailed the code for readability

- Comments are meant to help understand important or critical actions in code

#### Documentation generation

> **Not tested** : https://www.npmjs.com/package/react-doc-generator

(Comments, docstrings, documentation generator...)

## Python Coding Standard

(see [MEDomicsTools for Python](https://github.com/MEDomics-UdeS/MEDomicsTools/blob/main/python.md))
