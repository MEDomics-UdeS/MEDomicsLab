from learning.app_learning_blueprint import app_learning
from extraction_image.app_extraction_image_blueprint import app_extraction_image
from extraction_text.app_extraction_text_blueprint import app_extraction_text
from extraction_ts.app_extraction_ts_blueprint import app_extraction_ts
from extraction_MEDimage.app_extraction_blueprint import app_extraction_MEDimage
from input.app_input_blueprint import app_input
from evaluation.app_evaluation_blueprint import app_evaluation
from flask import Flask
from MEDprofiles_.app_MEDprofiles_blueprint import app_MEDprofiles


def create_app():
    app = Flask(__name__)
    app.register_blueprint(app_extraction_MEDimage,
                           url_prefix='/extraction_MEDimage')
    app.register_blueprint(app_learning, url_prefix='/learning')
    app.register_blueprint(app_extraction_image,
                           url_prefix='/extraction_image')
    app.register_blueprint(app_extraction_text, url_prefix='/extraction_text')
    app.register_blueprint(app_extraction_ts, url_prefix='/extraction_ts')
    app.register_blueprint(app_input, url_prefix='/input')
    app.register_blueprint(app_MEDprofiles, url_prefix='/MEDprofiles')
    app.register_blueprint(app_evaluation, url_prefix='/evaluation')

    return app
