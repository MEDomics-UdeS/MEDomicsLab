from learning.app_learning_blueprint import app_learning
from extraction_text.app_extraction_text_blueprint import app_extraction_text
from extraction_ts.app_extraction_ts_blueprint import app_extraction_ts
from extraction_MEDimage.app_extraction_blueprint import app_extraction_MEDimage
from learning_MEDimage.app_learning_medimage_blueprint import app_learning_MEDimage
from input.app_input_blueprint import app_input
from flask import Flask


app = Flask(__name__)
app.register_blueprint(app_extraction_MEDimage, url_prefix='/extraction_MEDimage')
app.register_blueprint(app_learning_MEDimage, url_prefix='/learning_MEDimage')
app.register_blueprint(app_learning, url_prefix='/learning')
app.register_blueprint(app_extraction_text, url_prefix='/extraction_text')
app.register_blueprint(app_extraction_ts, url_prefix='/extraction_ts')
app.register_blueprint(app_input, url_prefix='/input')

if __name__ == '__main__':
    app.run(debug=False, port=5000)