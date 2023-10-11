
from pyunpack import Archive
import shutil
import os


class CustomZipFile:

    def __init__(self, file_extension: str) -> None:
        self.file_extension = file_extension
        self._cwd = os.getcwd()

    def create_zip(self, path: str, custom_actions) -> None:
        """
        Creates a zip file from a folder
        Args:
            path: path of the folder to zip
            custom_actions (function): custom actions to do on the folder before zipping it
        Returns:
            None
        """
        # get the file extension from the path
        path = self.handle_input_path(path)
        self._cwd = path
        # create an empty folder (temporary)
        os.makedirs(path, exist_ok=True)

        # add custom file/folder inside
        custom_actions(path)

        # zip the folder
        shutil.make_archive(path, 'zip', path)

        # rename the zip file to have the custom extension
        if os.path.exists(path + self.file_extension):
            os.remove(path + self.file_extension)
        os.rename(path + ".zip", path + self.file_extension)

        # delete the temporary folder
        shutil.rmtree(path)

    def unzip_actions(self, path: str, custom_actions) -> None:
        """
        Unzips a zip file to a folder
        Args:
            path: path of the zip file to unzip
            custom_actions (function): custom actions to do on the unzipped folder before deleting it
        Returns:
            None
        """
        # get the file extension from the path
        extracted_path = self.handle_input_path(path)
        self._cwd = extracted_path
        # create an empty folder (temporary)
        os.makedirs(extracted_path, exist_ok=True)

        # unzip the folder
        Archive(path).extractall(extracted_path)

        # do custom actions on the unzipped folder
        custom_actions(extracted_path)

        # delete the temporary folder
        shutil.rmtree(extracted_path)

    def handle_input_path(self, input_path):
        path = input_path
        if '.' in input_path:
            input_file_extension = '.' + input_path.split('.')[1]
            if input_file_extension != self.file_extension:
                raise Exception("The file extension was supposed to be " + self.file_extension + " but it was " + input_file_extension + ".")
            path = input_path.split('.')[0]

        return path

    def create_sub_folder(self, name) -> str:
        """
        Creates a sub folder in the parent folder
        Args:
            name: name of the sub folder
        Returns:
            path of the sub folder
        """
        os.makedirs(os.path.join(self._cwd, name), exist_ok=True)
        return os.path.join(self._cwd, name)
