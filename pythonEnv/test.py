# check installed version
import pycaret
pycaret.__version__
# loading sample dataset from pycaret dataset module
from pycaret.datasets import get_data
data = get_data('diabetes')

from pycaret.classification import *
s = setup(data, target = 'Class variable', session_id = 123)

exp = ClassificationExperiment()

exp.setup(data, target = 'Class variable', session_id = 123)

exp.compare_models()
