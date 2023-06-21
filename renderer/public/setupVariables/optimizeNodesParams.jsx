import React from 'react';
import classificationSettings from './possibleSettings/learning/classificationSettings'
import regressionSettings from './possibleSettings/learning/regressionSettings'
import classificationModelsSettings from './possibleSettings/learning/classificationModelSettings';
import regressionModelsSettings from './possibleSettings/learning/regressionModelSettings';

const nodesParams = {
    tune_model: {
        type: "standardNode",
        classes: "action tune_model run",
        input: ["model"],
        output: ["model"],
        img: 'optimize.png',
        title: 'Tune model',
        possibleSettings: { classification: classificationSettings['tune_model'], regression: regressionSettings['tune_model'] },
    },
    ensemble_model: {
        type: "standardNode",
        classes: "action ensemble_model run",
        input: ["model"],
        output: ["model"],
        img: 'optimize.png',
        title: 'Ensemble model',
        possibleSettings: { classification: classificationSettings['ensemble_model'], regression: regressionSettings['ensemble_model'] },
    },
    blend_models: {
        type: "standardNode",
        classes: "action blend_models run",
        input: ["model"],
        output: ["model"],
        img: 'optimize.png',
        title: 'Blend models',
        possibleSettings: { classification: classificationSettings['blend_models'], regression: regressionSettings['blend_models'] },
    },
    stack_models: {
        type: "standardNode",
        classes: "action stack_models run",
        input: ["model"],
        output: ["model"],
        img: 'optimize.png',
        title: 'Stack models',
        possibleSettings: { classification: classificationSettings['stack_models'], regression: regressionSettings['stack_models'] },
    },
    calibrate_model: {
        type: "standardNode",
        classes: "action calibrate_model run",
        input: ["model"],
        output: ["model"],
        img: 'optimize.png',
        title: 'Calibrate model',
        possibleSettings: { classification: classificationSettings['calibrate_model'] },
    },


}

export default nodesParams;

