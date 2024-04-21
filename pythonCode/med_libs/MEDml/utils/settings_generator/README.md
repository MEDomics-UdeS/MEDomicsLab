# Settings generation

This folder contains the scripts to generate the settings for the learning process. It opens the webpage containing the read the docs [documentation of pycaret](https://pycaret.readthedocs.io/en/latest/index.html).

# How to use Settings generation

1. Create a conda environment with the following command:

```bash
conda create -n settings_gen_env python=3.10
```

2. Activate the environment with the following command:

```bash
conda activate settings_gen_env
```

3. Install the requirements with the following command:

```bash
pip install -r requirements.txt
```

> Note: you have to be in the folder where the requirements.txt file is located

4. Run the script with the following command for general settings generation:

```bash
python settings_generator.py --ml_type classification --save_path <absolute_path_to_the_folder_where_the_settings_will_be_generated>
python settings_generator.py --ml_type regression --save_path <absolute_path_to_the_folder_where_the_settings_will_be_generated>
```

> Note: the mltype can be either "classification" or "regression"

5. Run the script with the following command for models settings generation:

```bash
python models_settings_generator.py --mltype classification --path <absolute_path_to_the_folder_where_the_settings_will_be_generated>
python models_settings_generator.py --mltype regression --path <absolute_path_to_the_folder_where_the_settings_will_be_generated>
```
