import json
import os
import sys
from pathlib import Path

sys.path.append(
    str(Path(os.path.dirname(os.path.abspath(__file__))).parent.parent))
from med_libs.GoExecutionScript import GoExecutionScript, parse_arguments
from med_libs.server_utils import go_print
from med_libs.mongodb_utils import connect_to_mongo

# Parse arguments
json_params_dict, id_ = parse_arguments()
go_print("running script.py:" + id_)


class GoExecScriptAppend(GoExecutionScript):
    """
    This class overwrites an existing MongoDB collection while keeping existing columns.

    Args:
        json_params: Input JSON parameters
        _id: Request ID (optional)
    """

    def __init__(self, json_params: dict, _id: str = None):
        super().__init__(json_params, _id)
        self.results = {"status": "error", "message": "Process not completed."}  # Default response

    def _custom_process(self, json_config: dict) -> dict:
        """
        Overwrites the specified collection with new data while preserving existing columns.
        """
        try:
            go_print("🔍 Received JSON Config:")
            go_print(json.dumps(json_config, indent=4))  # ✅ Affiche l'entrée JSON formatée

            # Vérifier si les données sont bien passées
            if "collectionName" not in json_config or "data" not in json_config:
                raise ValueError("Invalid JSON format: 'collectionName' or 'data' missing.")

            # Set local variables
            collection_name = json_config["collectionName"]
            new_data = json_config["data"]

            # ✅ Log des données à insérer pour voir si elles sont correctes
            go_print("🔍 Data to be inserted:")
            go_print(json.dumps(new_data, indent=4))

            # Connect to MongoDB
            db = connect_to_mongo()
            collection = db[collection_name]

            # 🔹 1. Récupérer un document existant pour voir les colonnes actuelles
            existing_doc = collection.find_one({}, {"_id": 0})
            go_print("🔍 Existing document structure (before overwrite):")
            go_print(json.dumps(existing_doc, indent=4) if existing_doc else "No existing document found.")

            if existing_doc:
                all_keys = set(existing_doc.keys())  # Récupère toutes les colonnes existantes
            else:
                all_keys = set()

            # Ajouter toutes les clés des nouvelles données
            for doc in new_data:
                all_keys.update(doc.keys())

            # 🔹 2. Afficher les clés fusionnées
            go_print(f"🔍 All keys after merging old and new data: {all_keys}")

            # 🔹 3. Créer un document temporaire avec toutes les colonnes
            temp_doc = {key: None for key in all_keys}  
            temp_id = collection.insert_one(temp_doc).inserted_id

            # 🔹 4. Supprimer uniquement les documents, mais PAS la structure
            go_print(f"🔍 Clearing data in collection: {collection_name} while keeping schema")
            collection.delete_many({"_id": {"$ne": temp_id}})  

            # 🔹 5. Insérer les nouvelles données
            collection.insert_many(new_data)

            # 🔹 6. Supprimer le document temporaire
            collection.delete_one({"_id": temp_id})

            # 🔹 7. Retourner le succès
            self.results = {
                "status": "success",
                "message": "Data overwritten successfully while keeping existing schema."
            }

        except Exception as e:
            # 🔹 8. Gestion des erreurs
            self.results = {"status": "error", "message": str(e)}
            go_print(f"❌ Error: {str(e)}")

        return self.results  # ✅ Retourne bien les résultats




if __name__ == "__main__":
    script = GoExecScriptAppend(json_params_dict, id_)
    script.start()  # Start the process and execute `_custom_process`
