# check installed version
import pycaret
print(pycaret.__version__)


from pycaret.datasets import get_data
data = get_data('diabetes')

from pycaret.classification import ClassificationExperiment
exp = ClassificationExperiment()

type(exp)

exp.setup(data, target = 'Class variable', session_id = 123)

best = exp.compare_models()

exp.plot_model(best, plot = 'auc')
