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

| Folder        | Description                                                                        |
| ------------- | ---------------------------------------------------------------------------------- |
| /app          | Electron files                                                                     |
| /flask_server | All server side, python/[flask](https://flask.palletsprojects.com/) related, files |
| /flask_server | All server side, python/[flask](https://flask.palletsprojects.com/) related, files |
| /local        | Default local data storing                                                         |
| /main         | Electron related contents                                                          |
| /node_modules | Contains saved libraries (created from `npm install`)                              |
| /renderer     | NextJs related content                                                             |
| /ressources   | Electron ressources (icons, etc.)                                                  |
> Nextron automatically generated folders : /app, /main, /nodes_modules, /ressources, /renderer and /resources
> Nextron automatically generated folders : /app, /main, /nodes_modules, /ressources, /renderer and /resources

## Style

- Use [css react modules](https://create-react-app.dev/docs/adding-a-css-modules-stylesheet/)
- import order (\_app.js)
  ```javascript
  import 'bootstrap/dist/css/bootstrap.min.css';
  import <all other global css libraries>
  ```

## Naming Conventions

### Javascript/react

- Component : PascalCase
- Component file name : camelCase
- Each file name should be the same as the component defined inside
- Component creation : prioritize function implementation over class
  ```javascript
  export default const myComponent = (someProps) =­> {
  	return (<></>)
  }
  ```
- Function creation: prioritize arrow implementation
  ```javascript
  const myFct = (someParams) =­> {}
  ```

> See [react naming convention](https://www.upbeatcode.com/react/react-naming-conventions/)

## Components Structure

```bash
components
│   navbar.jsx
│
├───flow
│       handlers.jsx
│       node.jsx
│       sidebarAvailableNodes.jsx
│       workflowBase.jsx
│
├───learning
│   │   checkOption.jsx
│   │   input.jsx
│   │   modalSettingsChooser.jsx
│   │   workflow.jsx
│   │
│   └───nodesTypes
│           groupNode.jsx
│           optimizeIO.jsx
│           selectionNode.jsx
│           standardNode.jsx
│
└───mainPages
        home.jsx
        input.jsx
        learning.jsx
```

> To generate this : ` tree .\renderer\components\ /f`

## Syntax

(ES6 for JS as mentionned by Electron, for Python Electron follows Chromium's Coding Style)

### Usage of [eslint](https://eslint.org/docs/latest/use/getting-started)

The file eslintrc.js contains the rules to follow. To verify manually rules, run `npx eslint ./` in the root folder of the project. To fix automatically some rules, run `npx eslint ./ --fix`

You can also use the [prettier & eslint](https://marketplace.visualstudio.com/items?itemName=rvest.vs-code-prettier-eslint) extension for VSCode to automatically format your code and check rules.


## Documentation

#### Docstring

```javascript
/**
 * @param {type} someParams description
 * @return {type} description
 * @description
 * functionnal description of the function/React object
 */
const myfct = (someParams) =­> {}
```

#### Comments

- Do not over detailed the code for readability
- Comments are meant to help understand important or critical actions in code

#### Documentation generation

> **Not tested** : https://www.npmjs.com/package/react-doc-generator

(Comments, docstrings, documentation generator...)


## Python Coding Standard

(see [MEDomicsTools for Python](https://github.com/MEDomics-UdeS/MEDomicsTools/blob/main/python.md))
