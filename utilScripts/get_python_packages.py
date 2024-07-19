import os
from typing import Set

def find_python_files(directory: str) -> Set[str]:
    """
    Recursively find all Python files in the given directory.

    Args:
    - directory: The directory to search in.

    Returns:
    A set of paths to Python files.
    """
    python_files = set()
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith('.py'):
                python_files.add(os.path.join(root, file))
    return python_files

def extract_imports(file_path: str) -> Set[str]:
    """
    Extract imported packages from a Python file.

    Args:
    - file_path: The path to the Python file.

    Returns:
    A set of imported package names.
    """
    imports = set()
    with open(file_path, 'r', encoding='utf-8') as file:
        for line in file:
            line = line.strip()
            if line.startswith('import ') and ' as ' not in line:
                package = line.split(' ')[1].split('.')[0]
                imports.add(package.lower())
            elif line.startswith('from ') and ' import ' in line:
                package = line.split(' ')[1].split('.')[0]
                imports.add(package.lower())
    return imports

def create_requirements(directory: str, output_file: str):
    """
    Create a requirements.txt file from all Python files in the given directory.

    Args:
    - directory: The directory to search in.
    - output_file: The path to the output .txt file.
    """
    all_imports = set()
    for file_path in find_python_files(directory):
        all_imports.update(extract_imports(file_path))
    
    with open(output_file, 'w', encoding='utf-8') as file:
        for package in sorted(all_imports):
            file.write(f"{package}\n")

# Example usage
if __name__ == "__main__":
    create_requirements('C:\\Users\\nicol\\Documents\\Github\\MEDapp\\MEDomicsLab\\pythonCode', 'requirements_auto_generated.txt')