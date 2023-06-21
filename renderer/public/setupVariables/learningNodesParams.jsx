import classificationSettings from "./possibleSettings/learning/classificationSettings"
import regressionSettings from "./possibleSettings/learning/regressionSettings"
import classificationModelsSettings from "./possibleSettings/learning/classificationModelSettings";
import regressionModelsSettings from "./possibleSettings/learning/regressionModelSettings";

const nodesParams = {
	dataset: {
		type: "standardNode",
		classes: "object dataset run",
		input: [],
		output: ["dataset"],
		img: "dataset.png",
		title: "Dataset",
		possibleSettings: {
			classification: classificationSettings["dataset"],
			regression: regressionSettings["dataset"]
		},
	},
	model: {
		type: "selectionNode",
		classes: "object model run",
		input: [],
		output: ["model_config"],
		img: "model.png",
		title: "Model",
		possibleSettings: { classification: classificationModelsSettings, regression: regressionModelsSettings },
	},
	clean: {
		type: "standardNode",
		classes: "action clean run",
		input: ["dataset"],
		output: ["dataset"],
		img: "clean.png",
		title: "Clean",
		possibleSettings: { classification: classificationSettings["clean"], regression: regressionSettings["clean"] },
	},
	split: {
		type: "standardNode",
		classes: "action split run",
		data: { "input": ["dataset"], "output": ["dataset"] },
		input: ["dataset"],
		output: ["dataset", "dataset"],
		img: "split.png",
		title: "Split",
		possibleSettings: { classification: classificationSettings["split"], regression: regressionSettings["split"] },
	},
	compare_models: {
		type: "standardNode",
		classes: "action compare_models run",
		input: ["dataset"],
		output: ["model"],
		img: "compare_models.png",
		title: "Compare models",
		possibleSettings: { classification: classificationSettings["compare_models"], regression: regressionSettings["compare_models"] },
	},
	create_model: {
		type: "standardNode",
		classes: "action create_model run",
		input: ["dataset", "model_config"],
		output: ["model"],
		img: "create_model.png",
		title: "Create model",
		possibleSettings: { classification: classificationSettings["create_model"], regression: regressionSettings["create_model"] },
	},
	optimize: {
		type: "groupNode",
		classes: "action optimize run",
		input: ["model"],
		output: ["model"],
		img: "optimize.png",
		title: "Optimize",
		possibleSettings: { classification: classificationSettings["optimize"], regression: regressionSettings["optimize"] },
	},
	analyse: {
		type: "selectionNode",
		classes: "action analyse run",
		data: { "input": ["model"], "output": ["model"] },
		input: ["model"],
		output: [],
		img: "analyse.png",
		title: "Analyse",
		possibleSettings: { classification: classificationSettings["analyse"], regression: regressionSettings["analyse"] },
	},
	deploy: {
		type: "selectionNode",
		classes: "action deploy run",
		data: { "input": ["model"], "output": ["model"] },
		input: ["model"],
		output: [],
		img: "deploy.png",
		title: "Deploy",
		possibleSettings: { classification: classificationSettings["deploy"], regression: regressionSettings["deploy"] },
	},

}

export default nodesParams;
