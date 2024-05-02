/* eslint-disable */
const flSettings = {
  
    "dataset": {
        "options": {
            
            "ignore_features": {
                "type": "custom-list",
                "tooltip": "<p>ignore_features param can be used to ignore features during preprocessing\nand model training. It takes a list of strings with column names that are\nto be ignored.</p>\n",
                "default_val": "None"
            },
 
          
        },
        "code": "",
        "default": {
            "files": {
                "type": "data-input",
                "tooltip": "<p>Specify path to csv file or to medomics folder</p>"
            }
        }
    },
 
}; 
 export default flSettings;