from pymongo import MongoClient
from pymongo.errors import DuplicateKeyError
import sys

def connect_to_mongo():
    # Remplacez par les détails de votre connexion MongoDB
    client = MongoClient('mongodb://localhost:27017/')
    db = client['data']
    return db

def insert_med_data_object_if_not_exists(med_data, json_data=None):
    db = connect_to_mongo()
    collection = db['medDataObjects']

    # Vérifier si le MEDDataObject existe dans la base de données
    existing_object_by_id = collection.find_one({'id': med_data.id})
    if existing_object_by_id:
        # Si l'objet existe déjà dans la base de données, on s'arrête ici
        return existing_object_by_id['id']

    existing_object_by_attributes = collection.find_one({
        'name': med_data.name,
        'type': med_data.type,
        'parentID': med_data.parentID
    })
    if existing_object_by_attributes:
        # Si l'objet existe déjà dans la base de données, on s'arrête ici
        return existing_object_by_attributes['id']

    # Insérer le MEDDataObject s'il n'existe pas
    try:
        result = collection.insert_one(med_data.to_dict())
        print(f"MEDDataObject inserted with _id: {result.inserted_id}")
    except DuplicateKeyError:
        print(f"Duplicate key error for id: {med_data.id}")
        return med_data.id

    # Ajouter l'ID de l'objet inséré aux enfants de son parent
    if med_data.parentID:
        parent = collection.find_one({'id': med_data.parentID})
        if parent:
            children = parent.get('childrenIDs', [])

            # Vérifier si l'enfant est déjà dans les enfants du parent
            if med_data.id not in children:
                # Récupérer les objets enfants pour les trier
                children_objects = list(collection.find({'id': {'$in': children}}))
                children_objects.append(med_data.to_dict())

                # Trier les objets enfants d'abord par type (dossiers en premier) puis par ordre alphabétique
                children_objects.sort(key=lambda x: (x['type'] != 'directory', x['name']))

                # Extraire les IDs triés
                children = [child['id'] for child in children_objects]

                # Mettre à jour le parent avec les IDs des enfants triés
                collection.update_one({'id': med_data.parentID}, {'$set': {'childrenIDs': children}})

    # Insérer les données du MEDDataObject (s'il contient des données)
    if json_data:
        data_collection = db[med_data.id]
        result = data_collection.insert_many(json_data)
        print(f"Data inserted with {len(result.inserted_ids)} documents")

    return med_data.id