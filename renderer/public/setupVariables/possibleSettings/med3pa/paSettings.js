/* eslint-disable */
const paSettings = {
  dataset_loader: {
    options: {
      ignore_features: {
        type: "custom-list",
        tooltip: "<p>ignore_features param can be used to ignore features during preprocessing\nand model training. It takes a list of strings with column names that are\nto be ignored.</p>\n",
        default_val: "None"
      }
    },
    code: "",
    datasets:{
      default: {
        files: [
          { name: "Training Set", target: "" },
          { name: "Validation Set", target:""},
          { name: "Test Set", target: "" },
        ],
      
      tooltip:"<p>Select Datasets Spicific to a base classification model</p>", 
      },
      detectronNode: {
        files: [
          { name: "Test Set" , target: ""},
          { name: "Test Set (Shifted)",target: ""},
        ],
        
        tooltip:"<p>Select Datasets Spicific to Detectron</p>", 
      },
      med3paNode: {
        files: [
          { name: "Internal Validation Set", target: "" },
          { name: "External Validation Set", target: "" },
        ],
        
        tooltip:"<p>Select Datasets Spicific to MED3pa</p>", 
      }
  },
},
  med3pa: {
    tree_depth: {
      type: "int",
      tooltip: "Depth of the decision tree for med3pa",
      default_val: 5 // Default value for tree depth
    },
    min_leaves_ratio: {
      type: "int",
      tooltip: "Minimum ratio of leaves for med3pa",
      default_val: 2 // Default value for minimum leaves ratio
    },
    metrics: {
      type: "list-multiple",
      tooltip: "Evaluation metrics for med3pa",
      options: [
        { name: "AUC" },
        { name: "F1-Score" },
        { name: "Precision" },
        { name: "Recall" },
        { name: "Specificity" },
        { name: "Accuracy" },        
      ],
      default_val: ["AUC","F1-Score","Precision","Accuracy", "Recall"] // Default value for metrics 
    },
  },
   detectron: {
    sample_size: {
      type: "int",
      tooltip: "The size of the Testing Set N",
      default_val: 20 // Default value for tree depth
    }, 
    ensemble_size : {
      type: "int",
      tooltip: "Number of CDCs to train",
      default_val: 5 // Default value for minimum leaves ratio
    },
    num_rounds: {
      type: "int",
      tooltip: "Number of rounds to train the ensemble",
      default_val: 100 // Default value for minimum leaves ratio
    },
    patience: {
      type: "int",
      tooltip: "Patience of the Early Stopping",
      default_val: 3 // Default value for minimum leaves ratio
    },
    detectron_test: {
      type: "list-multiple",
      tooltip: "The types of Detectron test to run",
      options: [
        { name: "Detectron Disagreement" },
        { name: "Detecton with Mann-Whitney" },
        { name: "Detectron Entropy" },
        { name: "Detectron with KS-test" },    
      ],
      default_val: ["Detectron Disagreement","Detecton with Mann-Whitney"] // Default value for metrics 
    }
  },
  evaluation:{
    metrics: {
      type: "list-multiple",  
      tooltip: "Evaluation metrics for ML models",
      options: [
        { name: "AUC" },  
        { name: "F1-Score" },
        { name: "Accuracy"},
        { name: "Sensitivity"},
        { name: "Recall"},
        { name: "Specificity"},
        { name: "Precision"},
        { name: "Balanced Accuracy"},
        { name: "Log Loss"},
      ],
      default_val: ["AUC","Balanced Accuracy", "F1-Score"]
    }
  },
  evalDetectron:{
    metrics: {
      type: "list-multiple",  
      tooltip: "Evaluation metrics for Detectron",
      options: [
        { name: "AUC" },  
        { name: "Sensitivity"},
        { name: "Specificity"},
        { name: "Precision"},
      ],
      default_val: ["AUC"]
    },
  },
  evalMed3pa:{
    metrics: {
      type: "list-multiple",  
      tooltip: "Evaluation metrics for Detectron",
      options: [
        { name: "AUC" },  
        { name: "Balanced Accuracy"},
        { name: "Specificity"},
        { name: "Precision"},
      ],
      default_val: ["AUC", "Balanced Accuracy"]
    }
  }
  }


export default paSettings
