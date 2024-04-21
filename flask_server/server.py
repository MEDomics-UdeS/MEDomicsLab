from extraction_MEDimage.app_extraction_blueprint import app_extraction_MEDimage
from learning_MEDimage.app_learning_medimage_blueprint import app_learning_MEDimage
from flask import Flask


app = Flask(__name__)
app.register_blueprint(app_extraction_MEDimage, url_prefix='/extraction_MEDimage')
app.register_blueprint(app_learning_MEDimage, url_prefix='/learning_MEDimage')

if __name__ == '__main__':
    app.run(debug=False, port=5000)