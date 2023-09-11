# MEDomicsLab - Server side

This is the server side of the MEDomicsLab project. It is built using Flask, a Python web framework, and is responsible for handling requests from the client side and returning appropriate responses. The server side is responsible for processing data, running algorithms, and generating reports. It is an essential component of the MEDomicsLab project and is designed to be scalable and efficient.

[Vidéo d'introduction](https://bit.ly/3W66yNO)

## Setup - developemment

### 1. Installation of [Anaconda](https://www.anaconda.com/products/distribution)

### 2. Creation of conda environnement

```

cd <.../MEDomicsLab>

conda create --name medomics_env python=3.9

conda activate medomics_env

pip install -r Flask_server/requirements.txt

```

### 3. Additionnal setup

You must replace the content of this file: path2condaenv_toDeleteInProd.txt located at the root of the project.
You should place the absolute path that explicit wich interpreter to use. Following the precedent step, you have to find where the python.exe of your newly created environnement is located and copy it into the file.

## To generate the documentation locally

We used sphinx to create the documentation for this project and you check it out in this [link](https://medimage.readthedocs.io/en/latest/). But you can generate and host it locally by compiling the documentation source code using:

```

cd docs

./buildall.cmd

```

> **If jsdoc is not recognized :**

>

> 1.  Install [node.js](https://nodejs.org/en/download/) if you don't have it

> 2.  In a terminal, `npm install -g jsdoc`

Then open it locally using:

```

cd _build/html

python -m http.server

```

Or in a browser, open this file `docs/_build/html/index.html`

## Learning module explaination

### Frontend

https://user-images.githubusercontent.com/54538310/215623242-58d21de6-9a18-4d0f-a291-fe5fe9318946.mp4

### Backend

https://user-images.githubusercontent.com/54538310/215622981-84957582-7d00-4ee3-a584-6c8578f73be1.mp4
