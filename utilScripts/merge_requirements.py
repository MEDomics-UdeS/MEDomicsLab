def parse_requirements(file_path):
    """
    Parse a requirements.txt file and return a dictionary of packages and versions.
    """
    requirements = {}
    with open(file_path, 'r', encoding='utf-8') as file:
        for line in file:
            if '==' in line:
                package, version = line.strip().split('==')
            else:
                package = line.strip()
                version = None
            requirements[package] = version
    return requirements

def merge_requirements(unversioned_file, versioned_file, output_file):
    """
    Merge two requirements.txt files, prioritizing the version from the versioned file.
    """
    unversioned_reqs = parse_requirements(unversioned_file)
    versioned_reqs = parse_requirements(versioned_file)

    with open(output_file, 'w', encoding='utf-8') as file:
        for package in unversioned_reqs:
            if package in versioned_reqs and versioned_reqs[package] is not None:
                # Write package with version from the versioned file
                file.write(f"{package}=={versioned_reqs[package]}\n")
            elif package in versioned_reqs:
                # Write package without version (exists in both but no version specified in versioned file)
                file.write(f"{package}\n")

# Example usage
if __name__ == "__main__":
    merge_requirements('C:\\Users\\nicol\\Documents\\Github\\MEDapp\\MEDomicsLab\\requirements_auto_generated.txt', 'C:\\Users\\nicol\\Documents\\Github\\MEDapp\\MEDomicsLab\\pythonEnv\\requirements.txt', 'merged_requirements.txt')