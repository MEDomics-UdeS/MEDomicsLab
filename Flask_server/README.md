# MEDml
[Vidéo d'introduction](https://bit.ly/3W66yNO)


## MEDapp : Application Flask (se retrouve dans [MEDapp](./MEDapp/)).
- app.py : fichier principal de l'application initiale
- app_extraction.py : fichier de l'application d'extraction
- app_extraction_blueprint.py : fichier de l'application d'extraction sous forme de [blueprint](https://flask.palletsprojects.com/en/2.2.x/blueprints/) 
- app_with_blueprint.py : fichier de l'application initiale avec les blueprints (application complète)

##### Utilisez un environnement anaconda avec python 3.9


## Installation of [Anaconda](https://www.anaconda.com/products/distribution) environment : 
```
git clone git@github.com:NicoLongfield/MEDml.git
cd MEDml
conda env create --name MEDml --file environment.yml
conda activate MEDml
git submodule update --init --recursive
```
## To generate the documentation locally
We used sphinx to create the documentation for this project and you check it out in this [link](https://medimage.readthedocs.io/en/latest/). But you can generate and host it locally by compiling the documentation source code using:

```
cd docs
./buildall.cmd
```
> **If jsdoc is not recognized :**
> 
> 1. Install [node.js](https://nodejs.org/en/download/) if you don't have it 
> 2. In a terminal, `npm install -g jsdoc`

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


